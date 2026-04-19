import { NextRequest, NextResponse } from 'next/server';
import { validateVendor } from '@/lib/odoo-client';
import { setSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/auth/login
 * Authenticate a vendor by RUT.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espere un minuto.' },
        { status: 429 }
      );
    }

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

    await setSession({
      partnerId: partner.id,
      partnerName: partner.name,
      vat: partner.vat,
      email: partner.email,
      type: 'vendor',
      exp: Date.now() + 8 * 60 * 60 * 1000,
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
