/**
 * Demo data for export shipments module.
 */

export interface ExportShipment {
  id: number;
  name: string; // e.g. "EMB-00001"
  dus: string; // N DUS
  despacho: string; // N Despacho
  booking: string; // N Reserva/Booking
  saleOrderId: number;
  saleOrderName: string;
  customsAgencyId: number;
  customsAgencyName: string;
  containerLimit: number;
  containersUsed: number;
  state: 'draft' | 'active' | 'closed';
  createdAt: string;
}

export interface ExportContainer {
  id: number;
  shipmentId: number;
  guideId: number;
  guideName: string;
  containerNumber: string;
  sealNumber: string;
  netWeight: number;
  tareWeight: number;
  createdAt: string;
}

export const DEMO_SHIPMENTS: ExportShipment[] = [
  {
    id: 1,
    name: 'EMB-00001',
    dus: 'DUS-2026-5501',
    despacho: 'DESP-88012',
    booking: 'BK-HMB-2026-001',
    saleOrderId: 2,
    saleOrderName: 'SO-2026-0101',
    customsAgencyId: 6,
    customsAgencyName: 'Aduanas Ultraport Ltda.',
    containerLimit: 3,
    containersUsed: 1,
    state: 'active',
    createdAt: '2026-04-05',
  },
  {
    id: 2,
    name: 'EMB-00002',
    dus: 'DUS-2026-5502',
    despacho: 'DESP-88013',
    booking: 'BK-SHA-2026-015',
    saleOrderId: 3,
    saleOrderName: 'SO-2026-0102',
    customsAgencyId: 7,
    customsAgencyName: 'Agencia Aduana Stein y Cia.',
    containerLimit: 5,
    containersUsed: 0,
    state: 'active',
    createdAt: '2026-04-08',
  },
  {
    id: 3,
    name: 'EMB-00003',
    dus: 'DUS-2026-5490',
    despacho: 'DESP-87999',
    booking: 'BK-HOU-2026-022',
    saleOrderId: 2,
    saleOrderName: 'SO-2026-0101',
    customsAgencyId: 6,
    customsAgencyName: 'Aduanas Ultraport Ltda.',
    containerLimit: 2,
    containersUsed: 2,
    state: 'closed',
    createdAt: '2026-03-20',
  },
];

export const DEMO_CONTAINERS: ExportContainer[] = [
  {
    id: 1,
    shipmentId: 1,
    guideId: 1,
    guideName: 'GD-00001',
    containerNumber: 'MSCU-1234567',
    sealNumber: 'SL-001122',
    netWeight: 22000,
    tareWeight: 2200,
    createdAt: '2026-04-10',
  },
  {
    id: 2,
    shipmentId: 3,
    guideId: 2,
    guideName: 'GD-00002',
    containerNumber: 'HLCU-7654321',
    sealNumber: 'SL-003344',
    netWeight: 24500,
    tareWeight: 2300,
    createdAt: '2026-03-22',
  },
  {
    id: 3,
    shipmentId: 3,
    guideId: 3,
    guideName: 'GD-00003',
    containerNumber: 'CMAU-9876543',
    sealNumber: 'SL-005566',
    netWeight: 21800,
    tareWeight: 2150,
    createdAt: '2026-03-25',
  },
];

let shipmentCounter = 4;
let containerCounter = 4;

export function createDemoShipment(data: {
  dus: string;
  despacho: string;
  booking: string;
  saleOrderId: number;
  saleOrderName: string;
  customsAgencyId: number;
  customsAgencyName: string;
  containerLimit: number;
}): ExportShipment {
  const shipment: ExportShipment = {
    id: shipmentCounter,
    name: `EMB-${String(shipmentCounter).padStart(5, '0')}`,
    dus: data.dus,
    despacho: data.despacho,
    booking: data.booking,
    saleOrderId: data.saleOrderId,
    saleOrderName: data.saleOrderName,
    customsAgencyId: data.customsAgencyId,
    customsAgencyName: data.customsAgencyName,
    containerLimit: data.containerLimit,
    containersUsed: 0,
    state: 'active',
    createdAt: new Date().toISOString().split('T')[0],
  };

  shipmentCounter++;
  DEMO_SHIPMENTS.push(shipment);
  return shipment;
}

export function addDemoContainer(data: {
  shipmentId: number;
  guideId: number;
  guideName: string;
  containerNumber: string;
  sealNumber: string;
  netWeight: number;
  tareWeight: number;
}): ExportContainer | { error: string } {
  const shipment = DEMO_SHIPMENTS.find((s) => s.id === data.shipmentId);
  if (!shipment) {
    return { error: 'Embarque no encontrado' };
  }

  if (shipment.state === 'closed') {
    return { error: 'El embarque esta cerrado' };
  }

  if (shipment.containersUsed >= shipment.containerLimit) {
    return { error: `Embarque ${shipment.name} ya alcanzo el limite de ${shipment.containerLimit} contenedores` };
  }

  const container: ExportContainer = {
    id: containerCounter++,
    shipmentId: data.shipmentId,
    guideId: data.guideId,
    guideName: data.guideName,
    containerNumber: data.containerNumber,
    sealNumber: data.sealNumber,
    netWeight: data.netWeight,
    tareWeight: data.tareWeight,
    createdAt: new Date().toISOString().split('T')[0],
  };

  DEMO_CONTAINERS.push(container);
  shipment.containersUsed++;

  return container;
}
