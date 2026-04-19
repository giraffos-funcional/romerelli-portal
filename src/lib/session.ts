import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

export interface PortalSession {
  partnerId: number;
  partnerName: string;
  vat: string;
  email: string;
  type: 'vendor' | 'dispatch';
  exp: number;
}

const COOKIE_NAME = 'portal_session';
const SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-change-me';

/**
 * Sign a payload with HMAC-SHA256 to prevent tampering.
 */
function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify a signed cookie value. Returns the payload if valid, null otherwise.
 */
function verify(cookieValue: string): string | null {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expectedSignature = sign(payload);

  // Timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return null;

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) return null;

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  return Buffer.from(payload, 'base64').toString('utf-8');
}

/**
 * Create a signed session cookie value.
 */
export function createSessionCookie(session: PortalSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64');
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/**
 * Set the session cookie with proper flags.
 */
export async function setSession(session: PortalSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionCookie(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
    path: '/',
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the current portal session from cookies.
 * Returns null if no valid session exists or signature is invalid.
 */
export async function getSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie) return null;

  try {
    // Try signed cookie first
    const payload = verify(sessionCookie.value);
    if (payload) {
      const session = JSON.parse(payload) as PortalSession;
      if (session.exp < Date.now()) return null;
      return session;
    }

    // Fallback: try legacy unsigned cookie (for existing sessions during migration)
    const legacySession = JSON.parse(sessionCookie.value) as PortalSession;
    if (legacySession.exp < Date.now()) return null;
    return legacySession;
  } catch {
    return null;
  }
}

/**
 * Require an active session. Redirects to login if none exists.
 */
export async function requireSession(): Promise<PortalSession> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}
