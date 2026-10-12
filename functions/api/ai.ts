import { authenticateRequest } from '../middleware/auth';

interface Env {
  GEMINI_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
}

interface AiRequestBody {
  prompt: string;
  attachments?: Array<{ mimeType: string; data: string }>;
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}

/**
 * Cloudflare Pages Function: Gemini API Secure Proxy
 * POST /api/ai
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const projectId = env.FIREBASE_PROJECT_ID || 'gavstack';
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Authenticate caller via Firebase ID Token
  try {
    await authenticateRequest(request, projectId);
  } catch (authError: unknown) {
    const message = authError instanceof Error ? authError.message : 'Unauthorized';
    return new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Parse request payload
  try {
    const body: AiRequestBody = await request.json();
    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing prompt text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    if (Array.isArray(body.attachments)) {
      body.attachments.forEach((att) => {
        parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
      });
    }
    parts.push({ text: body.prompt });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: body.options?.temperature ?? 0.7,
          maxOutputTokens: body.options?.maxOutputTokens ?? 4096,
          responseMimeType: body.options?.responseMimeType,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(JSON.stringify({ error: `Upstream AI error: ${errorText}` }), {
        status: geminiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await geminiResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
