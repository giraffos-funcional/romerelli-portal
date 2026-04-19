import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/odoo-client';

export async function GET() {
  const result = await healthCheck();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
