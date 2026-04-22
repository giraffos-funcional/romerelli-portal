import { NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';
import { authenticateDispatchUser } from '@/lib/odoo-client';
import { logger } from '@/lib/logger';

/**
 * Demo dispatch users — only used when `ALLOW_DEMO_DISPATCH=1` is set.
 * In production, auth hits real Odoo res.users records.
 */
const DEMO_DISPATCH_USERS: Record<
  string,
  { password: string; role: 'cajera' | 'admin_comex'; displayName: string }
> = {
  cajera1: { password: 'demo123', role: 'cajera', displayName: 'Cajera Demo' },
  'admin.comex': {
    password: 'demo123',
    role: 'admin_comex',
    displayName: 'Admin Comex Demo',
  },
};

/**
 * POST /api/auth/login/dispatch
 * Authenticate a dispatch user by username/password.
 *
 * Tries Odoo first. Falls back to hardcoded demo users only if
 * ALLOW_DEMO_DISPATCH=1 is set in env (staging convenience).
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(`dispatch-${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espere un minuto.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contrasena son requeridos' },
        { status: 400 }
      );
    }

    // 1. Try real Odoo authentication.
    try {
      const odooUser = await authenticateDispatchUser(username, password);
      if (odooUser) {
        await setSession({
          partnerId: 0,
          partnerName: odooUser.name,
          vat: '',
          email: `${username}@romerelli.cl`,
          type: 'dispatch',
          role: odooUser.role,
          companyId: odooUser.companyId,
          companyName: odooUser.companyName,
          exp: Date.now() + 8 * 60 * 60 * 1000,
        });
        return NextResponse.json({
          ok: true,
          user: { name: odooUser.name, role: odooUser.role },
        });
      }
    } catch (err) {
      logger.warn('odoo-auth-failed', { username, err: String(err) });
    }

    // 2. Fallback to demo users (only if explicitly enabled).
    if (process.env.ALLOW_DEMO_DISPATCH === '1') {
      const demo = DEMO_DISPATCH_USERS[username];
      if (demo && demo.password === password) {
        await setSession({
          partnerId: 0,
          partnerName: demo.displayName,
          vat: '',
          email: `${username}@romerelli.cl`,
          type: 'dispatch',
          role: demo.role,
          companyId: 1,
          companyName: 'Romerelli SpA',
          exp: Date.now() + 8 * 60 * 60 * 1000,
        });
        return NextResponse.json({
          ok: true,
          user: { name: demo.displayName, role: demo.role },
        });
      }
    }

    return NextResponse.json(
      { error: 'Usuario o contrasena incorrectos' },
      { status: 401 }
    );
  } catch (error) {
    logger.error('dispatch-login-error', { err: String(error) });
    return NextResponse.json(
      { error: 'Error de conexion con el servidor' },
      { status: 500 }
    );
  }
}
