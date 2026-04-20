/**
 * Demo data for dispatch guides module.
 */

export const DEMO_PARTNERS = [
  { id: 1, name: 'Minera Los Pelambres', vat: '76.009.698-9', street: 'Av. Apoquindo 4001', city: 'Santiago' },
  { id: 2, name: 'Codelco Chile', vat: '61.704.000-K', street: 'Huérfanos 1270', city: 'Santiago' },
  { id: 3, name: 'CAP Acero S.A.', vat: '91.297.000-0', street: 'Av. Santa Maria 0594', city: 'Santiago' },
  { id: 4, name: 'Recycling Corp USA', vat: '99.999.001-1', street: '123 Industrial Blvd', city: 'Houston, TX' },
  { id: 5, name: 'Metal Trading GmbH', vat: '99.999.002-2', street: 'Industriestraße 45', city: 'Hamburg' },
  { id: 6, name: 'Aduanas Ultraport Ltda.', vat: '78.456.789-0', street: 'Av. España 801', city: 'Valparaíso' },
  { id: 7, name: 'Agencia Aduana Stein y Cía.', vat: '77.123.456-7', street: 'Blanco 1199', city: 'Valparaíso' },
  { id: 8, name: 'Transportes Romerelli SpA', vat: '76.543.210-K', street: 'Camino Lo Echevers 600', city: 'Quilicura' },
];

export const DEMO_PRODUCTS = [
  { id: 101, name: 'Chatarra de Cobre Cat. A', default_code: 'CU-CAT-A', uom_id: [1, 'kg'] },
  { id: 102, name: 'Chatarra de Cobre Cat. B', default_code: 'CU-CAT-B', uom_id: [1, 'kg'] },
  { id: 103, name: 'Aluminio Reciclado Grado 1', default_code: 'AL-GR1', uom_id: [1, 'kg'] },
  { id: 104, name: 'Chatarra de Hierro Industrial', default_code: 'FE-IND', uom_id: [1, 'kg'] },
  { id: 105, name: 'Cobre Electrolítico Premium', default_code: 'CU-ELEC', uom_id: [1, 'kg'] },
  { id: 106, name: 'Bronce Reciclado', default_code: 'BR-REC', uom_id: [1, 'kg'] },
  { id: 107, name: 'Copper Scrap Grade A - Export', default_code: 'CU-EXP-A', uom_id: [1, 'kg'] },
  { id: 108, name: 'Chatarra Mixta', default_code: 'MIX-01', uom_id: [1, 'kg'] },
  { id: 109, name: 'Acero Inoxidable Reciclado', default_code: 'INOX-REC', uom_id: [1, 'kg'] },
  { id: 110, name: 'Plomo Reciclado', default_code: 'PB-REC', uom_id: [1, 'kg'] },
];

export const DEMO_SALE_ORDERS = [
  { id: 1, name: 'SO-2026-0100', partner_id: [1, 'Minera Los Pelambres'], date_order: '2026-04-01', amount_total: 5950000, state: 'sale' },
  { id: 2, name: 'SO-2026-0101', partner_id: [4, 'Recycling Corp USA'], date_order: '2026-04-05', amount_total: 32500.00, state: 'sale' },
  { id: 3, name: 'SO-2026-0102', partner_id: [5, 'Metal Trading GmbH'], date_order: '2026-04-08', amount_total: 48000.00, state: 'sale' },
  { id: 4, name: 'SO-2026-0103', partner_id: [2, 'Codelco Chile'], date_order: '2026-04-10', amount_total: 2380000, state: 'sale' },
  { id: 5, name: 'SO-2026-0104', partner_id: [3, 'CAP Acero S.A.'], date_order: '2026-04-12', amount_total: 714000, state: 'sale' },
];

export const DEMO_COUNTRIES = [
  { id: 1, name: 'Estados Unidos' },
  { id: 2, name: 'Alemania' },
  { id: 3, name: 'China' },
  { id: 4, name: 'Japón' },
  { id: 5, name: 'Corea del Sur' },
  { id: 6, name: 'India' },
  { id: 7, name: 'Brasil' },
  { id: 8, name: 'Perú' },
];

export const DEMO_INCOTERMS = [
  { id: 1, name: 'FOB - Free on Board' },
  { id: 2, name: 'CIF - Cost, Insurance & Freight' },
  { id: 3, name: 'CFR - Cost and Freight' },
  { id: 4, name: 'EXW - Ex Works' },
  { id: 5, name: 'FCA - Free Carrier' },
];

let guideCounter = 1;

export interface DemoGuide {
  id: number;
  name: string;
  guideType: string;
  guideTypeLabel: string;
  partnerName: string;
  date: string;
  state: string;
  productCount: number;
  peso: number;
  patente: string;
  chofer: string;
  tipoMaterial: string;
  referencia: string;
}

export const DEMO_GUIDES: DemoGuide[] = [];

export function createDemoGuide(data: {
  guideType: string;
  partnerId: number;
  dateDispatch: string;
  lines: Array<{ productId: number; quantity: number }>;
  peso?: number;
  patente?: string;
  chofer?: string;
  tipoMaterial?: string;
  referencia?: string;
}): DemoGuide {
  const partner = DEMO_PARTNERS.find((p) => p.id === data.partnerId);
  const typeLabels: Record<string, string> = {
    transfer: 'Traslado',
    national: 'Venta Nacional',
    export: 'Exportación',
  };

  const guide: DemoGuide = {
    id: guideCounter++,
    name: `GD-${String(guideCounter).padStart(5, '0')}`,
    guideType: data.guideType,
    guideTypeLabel: typeLabels[data.guideType] || data.guideType,
    partnerName: partner?.name || 'Desconocido',
    date: data.dateDispatch,
    state: 'confirmed',
    productCount: data.lines.length,
    peso: data.peso || 0,
    patente: data.patente || '',
    chofer: data.chofer || '',
    tipoMaterial: data.tipoMaterial || '',
    referencia: data.referencia || '',
  };

  DEMO_GUIDES.push(guide);
  return guide;
}
