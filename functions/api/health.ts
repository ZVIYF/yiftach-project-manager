/**
 * Cloudflare Pages Function: Health Check Endpoint
 * GET /api/health
 */
export async function onRequestGet(): Promise<Response> {
  const payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'yftach-project-manager',
    environment: 'production',
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

