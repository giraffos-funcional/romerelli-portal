import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

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

  // TODO: fetch from Odoo custom model/selection field
  return NextResponse.json(MATERIAL_TYPES);
}
