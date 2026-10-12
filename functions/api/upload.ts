import { authenticateRequest } from '../middleware/auth';

interface R2BucketBinding {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

interface Env {
  GAVSTACK_FILES: R2BucketBinding;
  FIREBASE_PROJECT_ID?: string;
  R2_PUBLIC_BASE_URL?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Cloudflare Pages Function: Secure R2 File Upload Endpoint
 * POST /api/upload
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const projectId = env.FIREBASE_PROJECT_ID || 'gavstack';
  const publicBase = env.R2_PUBLIC_BASE_URL || 'https://pub-9c667e19b45c48f587121dd5c62f3c64.r2.dev';

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

  // 2. Parse and validate multipart form data
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: 'Missing file payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: 'File size exceeds 20MB limit' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mimeType = file.type || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return new Response(JSON.stringify({ error: 'Unsupported file type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Generate sanitized R2 storage path
    const folder = (formData.get('folder') as string) || 'uploads';
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${safeName}`;

    // 4. Stream upload into Cloudflare R2
    await env.GAVSTACK_FILES.put(storagePath, file.stream(), {
      httpMetadata: { contentType: mimeType },
    });

    const publicUrl = `${publicBase}/${storagePath}`;
    return new Response(
      JSON.stringify({
        url: publicUrl,
        path: storagePath,
        name: file.name,
        size: file.size,
        type: mimeType,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (uploadError: unknown) {
    const message = uploadError instanceof Error ? uploadError.message : 'Upload processing failed';
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
