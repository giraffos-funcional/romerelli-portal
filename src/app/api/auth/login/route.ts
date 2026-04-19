import { NextRequest, NextResponse } from 'next/server';
import { validateVendor } from '@/lib/odoo-client';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/login
 * Authenticate a vendor by RUT.
 * MVP: RUT-only auth. Production should add password/token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vat } = body;

    if (!vat) {
      return NextResponse.json(
        { error: 'RUT es requerido' },
        { status: 400 }
      );
    }

    // Normalize RUT: remove dots, keep dash
    const normalizedVat = vat.replace(/\./g, '').trim();

    const partner = await validateVendor(normalizedVat);

    if (!partner) {
      return NextResponse.json(
        { error: 'RUT no encontrado o no es proveedor registrado' },
        { status: 401 }
      );
    }

    // MVP: Set session cookie with partner data
    // Production: use proper JWT + session management
    const sessionData = {
      partnerId: partner.id,
      partnerName: partner.name,
      vat: partner.vat,
      email: partner.email,
      type: 'vendor' as const,
      exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };

    const cookieStore = await cookies();
    cookieStore.set('portal_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });

    return NextResponse.json({
      ok: true,
      partner: {
        name: partner.name,
        vat: partner.vat,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error de conexion con el servidor' },
      { status: 500 }
    );
  }
}
