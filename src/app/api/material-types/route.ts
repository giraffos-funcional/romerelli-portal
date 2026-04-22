import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';
import { getMaterialTypes } from '@/lib/odoo-client';

const DEMO_PARTNER_ID = 9999;

// Hardcoded fallback — used in demo mode and while the Odoo custom module
// (x_romerelli.material.type) is not yet installed.
const MATERIAL_TYPES = [
  { id: 'chatarra_cobre', name: 'Chatarra de Cobre' },
  { id: 'chatarra_hierro', name: 'Chatarra de Hierro' },
  { id: 'chatarra_aluminio', name: 'Chatarra de Aluminio' },
  { id: 'chatarra_bronce', name: 'Chatarra de Bronce' },
  { id: 'chatarra_acero', name: 'Chatarra de Acero Inoxidable' },
  { id: 'chatarra_plomo', name: 'Chatarra de Plomo' },
  { id: 'chatarra_mixta', name: 'Chatarra Mixta' },
  { id: 'maquinaria', name: 'Maquinaria' },
  { id: 'equipos_computo', name: 'Equipos de Computacion' },
  { id: 'mobiliario', name: 'Mobiliario' },
  { id: 'otros', name: 'Otros' },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json(MATERIAL_TYPES);
  }

  // Production: read the Selection from stock.picking.x_tipo_material.
  try {
    const fromOdoo = await getMaterialTypes();
    if (fromOdoo && fromOdoo.length > 0) {
      return NextResponse.json(
        fromOdoo.map((t) => ({ id: t.value, name: t.label }))
      );
    }
    return NextResponse.json(MATERIAL_TYPES);
  } catch (error) {
    logger.error('Error fetching material types:', error);
    return NextResponse.json(MATERIAL_TYPES);
  }
}
