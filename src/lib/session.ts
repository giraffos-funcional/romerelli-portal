import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface PortalSession {
  partnerId: number;
  partnerName: string;
  vat: string;
  email: string;
  type: 'vendor' | 'dispatch';
  exp: number;
}

/**
 * Get the current portal session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('portal_session');

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value) as PortalSession;

    // Check expiration
    if (session.exp < Date.now()) {
      return null;
    }

    return session;
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
