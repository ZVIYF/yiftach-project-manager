import { jwtVerify, createRemoteJWKSet } from 'jose';

// Google public x509 cert JWKS endpoint for Firebase Authentication tokens
const GOOGLE_JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
);
const jwks = createRemoteJWKSet(GOOGLE_JWKS_URL);

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

/**
 * Validates a Firebase ID Token presented in the Authorization header.
 *
 * @param {Request} request - Cloudflare incoming request.
 * @param {string} projectId - Firebase Project ID.
 * @returns {Promise<AuthenticatedUser>} Authenticated user claims.
 */
export async function authenticateRequest(
  request: Request,
  projectId: string
): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new Error('Empty bearer token provided');
  }

  const expectedIssuer = `https://securetoken.google.com/${projectId}`;

  const { payload } = await jwtVerify(token, jwks, {
    issuer: expectedIssuer,
    audience: projectId,
  });

  if (!payload.sub) {
    throw new Error('Invalid token subject claim');
  }

  return {
    uid: payload.sub,
    email: (payload.email as string) || undefined,
  };
}
