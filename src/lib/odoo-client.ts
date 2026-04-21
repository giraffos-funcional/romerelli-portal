/**
 * Odoo JSON-RPC Client
 *
 * Connects to the Odoo instance via JSON-RPC using API key authentication.
 * All methods run server-side only (never expose the API key to the browser).
 */

const ODOO_URL = process.env.ODOO_URL!;
const ODOO_DB = process.env.ODOO_DB!;
const ODOO_API_KEY = process.env.ODOO_API_KEY!;
const ODOO_API_USER = process.env.ODOO_API_USER!;

let cachedUid: number | null = null;

interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: {
      name: string;
      debug: string;
      message: string;
    };
  };
}

async function jsonRpc<T = unknown>(
  url: string,
  method: string,
  params: Record<string, unknown>
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as JsonRpcResponse<T>;

  if (data.error) {
    const errMsg = data.error.data?.message || data.error.message;
    throw new Error(`Odoo RPC Error: ${errMsg}`);
  }

  return data.result as T;
}

/**
 * Authenticate with the Odoo instance and cache the UID.
 * Uses API key as password (Odoo 14+ API key auth).
 */
async function authenticate(): Promise<number> {
  if (cachedUid) return cachedUid;

  const uid = await jsonRpc<number>(
    `${ODOO_URL}/jsonrpc`,
    'call',
    {
      service: 'common',
      method: 'authenticate',
      args: [ODOO_DB, ODOO_API_USER, ODOO_API_KEY, {}],
    }
  );

  if (!uid) {
    throw new Error('Odoo authentication failed. Check API key and user.');
  }

  cachedUid = uid;
  return uid;
}

/**
 * Execute an Odoo model method via JSON-RPC.
 */
async function execute<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const uid = await authenticate();

  return jsonRpc<T>(
    `${ODOO_URL}/jsonrpc`,
    'call',
    {
      service: 'object',
      method: 'execute_kw',
      args: [ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs],
    }
  );
}

// ============================================================
// PUBLIC API — Vendor Portal
// ============================================================

/**
 * Validate vendor credentials (RUT + password/token).
 * Returns the partner record if valid.
 */
export async function validateVendor(
  vat: string
): Promise<{ id: number; name: string; vat: string; email: string } | null> {
  const partners = await execute<
    Array<{ id: number; name: string; vat: string; email: string }>
  >('res.partner', 'search_read', [
    [
      ['vat', '=', vat],
      ['supplier_rank', '>', 0],
    ],
    ['id', 'name', 'vat', 'email'],
  ], { limit: 1 });

  return partners.length > 0 ? partners[0] : null;
}

/**
 * Get vendor invoices (bills) for a given partner.
 */
export async function getVendorInvoices(
  partnerId: number,
  options: {
    offset?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    paymentState?: string;
  } = {}
) {
  const domain: unknown[][] = [
    ['partner_id', '=', partnerId],
    ['move_type', '=', 'in_invoice'],
    ['state', '=', 'posted'],
  ];

  if (options.dateFrom) {
    domain.push(['invoice_date', '>=', options.dateFrom]);
  }
  if (options.dateTo) {
    domain.push(['invoice_date', '<=', options.dateTo]);
  }
  if (options.paymentState) {
    domain.push(['payment_state', '=', options.paymentState]);
  }

  const fields = [
    'name',
    'invoice_date',
    'date',
    'amount_total',
    'amount_residual',
    'amount_untaxed',
    'amount_tax',
    'payment_state',
    'state',
    'l10n_latam_document_type_id',
    'l10n_latam_document_number',
    'currency_id',
    'ref',
  ];

  const [invoices, total] = await Promise.all([
    execute<Array<Record<string, unknown>>>('account.move', 'search_read', [
      domain,
      fields,
    ], {
      offset: options.offset || 0,
      limit: options.limit || 20,
      order: 'invoice_date desc',
    }),
    execute<number>('account.move', 'search_count', [domain]),
  ]);

  return { invoices, total };
}

/**
 * Get a single invoice detail with its lines.
 */
export async function getInvoiceDetail(
  invoiceId: number,
  partnerId: number
) {
  const invoices = await execute<Array<Record<string, unknown>>>(
    'account.move',
    'search_read',
    [
      [
        ['id', '=', invoiceId],
        ['partner_id', '=', partnerId],
        ['move_type', '=', 'in_invoice'],
        ['state', '=', 'posted'],
      ],
      [
        'name', 'invoice_date', 'date', 'amount_total', 'amount_residual',
        'amount_untaxed', 'amount_tax', 'payment_state', 'state',
        'l10n_latam_document_type_id', 'l10n_latam_document_number',
        'currency_id', 'ref', 'invoice_line_ids',
      ],
    ],
    { limit: 1 }
  );

  if (invoices.length === 0) return null;

  const invoice = invoices[0];
  const lineIds = invoice.invoice_line_ids as number[];

  let lines: Array<Record<string, unknown>> = [];
  if (lineIds.length > 0) {
    lines = await execute<Array<Record<string, unknown>>>(
      'account.move.line',
      'read',
      [
        lineIds,
        [
          'name', 'product_id', 'quantity', 'price_unit',
          'price_subtotal', 'price_total', 'display_type',
        ],
      ]
    );
  }

  return { ...invoice, lines };
}

/**
 * Fetch invoice PDF from Odoo's report service.
 * Uses the standard account.report_invoice report endpoint.
 *
 * TODO: Validate the exact auth flow with the target Odoo instance.
 * Odoo report downloads generally require a session cookie (web login) rather
 * than plain API key auth. One common approach is:
 *   1. POST to /web/session/authenticate to get a session cookie.
 *   2. GET /report/pdf/account.report_invoice/<id> with that cookie.
 * Adjust once the Odoo module / instance is available for testing.
 */
export async function getInvoicePdf(invoiceId: number): Promise<Buffer> {
  // Placeholder — implement once Odoo instance is available.
  // Keeping a clear signature so the route layer is already wired up.
  throw new Error(
    `getInvoicePdf: not implemented (invoiceId=${invoiceId}). ` +
      'Implement Odoo /report/pdf/account.report_invoice/<id> fetch with proper auth.'
  );
}

// ============================================================
// PUBLIC API — Dispatch Guides (Guias de Despacho)
// ============================================================

/**
 * Search sale orders for export dispatch guide linking.
 */
export async function searchSaleOrders(
  query: string,
  limit: number = 10
) {
  return execute<Array<Record<string, unknown>>>(
    'sale.order',
    'search_read',
    [
      [
        ['name', 'ilike', query],
        ['state', 'in', ['sale', 'done']],
      ],
      ['name', 'partner_id', 'date_order', 'amount_total'],
    ],
    { limit, order: 'date_order desc' }
  );
}

/**
 * Get partners (clients/customs agencies) for dispatch guide forms.
 */
export async function searchPartners(
  query: string,
  options: { isCustomer?: boolean; isSupplier?: boolean } = {}
) {
  const domain: unknown[] = [
    '|',
    ['name', 'ilike', query],
    ['vat', 'ilike', query],
  ];

  if (options.isCustomer) domain.push(['customer_rank', '>', 0]);
  if (options.isSupplier) domain.push(['supplier_rank', '>', 0]);

  return execute<Array<Record<string, unknown>>>(
    'res.partner',
    'search_read',
    [domain, ['name', 'vat', 'street', 'city']],
    { limit: 10 }
  );
}

/**
 * Get products for dispatch guide line selection.
 */
export async function searchProducts(query: string) {
  return execute<Array<Record<string, unknown>>>(
    'product.product',
    'search_read',
    [
      [
        '|',
        ['name', 'ilike', query],
        ['default_code', 'ilike', query],
      ],
      ['name', 'default_code', 'uom_id'],
    ],
    { limit: 20 }
  );
}

/**
 * Create a stock.picking (Guia de Despacho) in Odoo.
 */
export async function createDispatchGuide(data: {
  partnerId: number;
  guideType: string;
  dateDispatch: string;
  notes?: string;
  lines: Array<{
    productId: number;
    quantity: number;
    uomId: number;
    priceUnit?: number;
    description?: string;
  }>;
  // Export specific
  saleOrderId?: number;
  customsAgencyId?: number;
  // Transport fields (custom on stock.picking)
  peso?: number;
  patente?: string;
  chofer?: string;
  tipoMaterial?: string;
  referencia?: string;
}) {
  // Get the default outgoing picking type
  const pickingTypes = await execute<Array<Record<string, unknown>>>(
    'stock.picking.type',
    'search_read',
    [
      [['code', '=', 'outgoing']],
      ['id', 'name', 'default_location_src_id', 'default_location_dest_id', 'warehouse_id'],
    ],
    { limit: 1 }
  );

  if (pickingTypes.length === 0) {
    throw new Error('No outgoing picking type found');
  }

  const pickingType = pickingTypes[0];
  const destinationPartnerId = data.customsAgencyId || data.partnerId;

  // Build the picking create dict. Transport fields are custom (x_*) and
  // only sent when provided — Odoo rejects unknown fields if the module
  // isn't installed, so callers are responsible for gating on deployment.
  const pickingValues: Record<string, unknown> = {
    partner_id: destinationPartnerId,
    picking_type_id: pickingType.id,
    location_id: (pickingType.default_location_src_id as [number, string])[0],
    location_dest_id: (pickingType.default_location_dest_id as [number, string])[0],
    origin: data.notes || `Portal - ${data.guideType}`,
    scheduled_date: data.dateDispatch,
    move_ids_without_package: data.lines.map((line) => [
      0, 0, {
        name: line.description || 'Producto',
        product_id: line.productId,
        product_uom_qty: line.quantity,
        product_uom: line.uomId,
        location_id: (pickingType.default_location_src_id as [number, string])[0],
        location_dest_id: (pickingType.default_location_dest_id as [number, string])[0],
      },
    ]),
  };

  if (data.peso !== undefined) pickingValues.x_peso = data.peso;
  if (data.patente !== undefined) pickingValues.x_patente = data.patente;
  if (data.chofer !== undefined) pickingValues.x_chofer = data.chofer;
  if (data.tipoMaterial !== undefined) pickingValues.x_tipo_material = data.tipoMaterial;
  if (data.referencia !== undefined) pickingValues.x_referencia = data.referencia;
  if (data.saleOrderId !== undefined) pickingValues.sale_id = data.saleOrderId;

  const pickingId = await execute<number>('stock.picking', 'create', [pickingValues]);

  return pickingId;
}

// ============================================================
// PUBLIC API — Warehouses / Cost centers / Companies
// ============================================================

/**
 * Get all warehouses (stock.warehouse).
 */
export async function getWarehouses() {
  return execute<Array<Record<string, unknown>>>(
    'stock.warehouse',
    'search_read',
    [[], ['name', 'code']],
    { order: 'name' }
  );
}

/**
 * Get active analytic accounts (used as cost centers).
 */
export async function getCostCenters() {
  return execute<Array<Record<string, unknown>>>(
    'account.analytic.account',
    'search_read',
    [[['active', '=', true]], ['name', 'code']],
    { order: 'name' }
  );
}

/**
 * Get the companies a given user can access (res.users.company_ids).
 * Returns [{ id, name }] ready for the switch-company endpoint.
 */
export async function getAllowedCompanies(uid: number) {
  const users = await execute<Array<Record<string, unknown>>>(
    'res.users',
    'read',
    [[uid], ['company_ids']]
  );

  if (users.length === 0) return [];

  const companyIds = (users[0].company_ids as number[]) || [];
  if (companyIds.length === 0) return [];

  return execute<Array<Record<string, unknown>>>(
    'res.company',
    'read',
    [companyIds, ['name']]
  );
}

// ============================================================
// PUBLIC API — Material types
// ============================================================

/**
 * Get material types from Odoo.
 *
 * TODO: Once the custom module exists, fetch from `x_romerelli.material.type`
 * or from the selection on stock.picking.x_tipo_material. For now this
 * returns an empty list; the API route falls back to the hardcoded list.
 */
export async function getMaterialTypes(): Promise<
  Array<Record<string, unknown>>
> {
  return [];
}

// ============================================================
// PUBLIC API — Export Shipments (custom x_romerelli module)
// ============================================================

/**
 * List export shipments.
 *
 * TODO: Adjust model name and field list after the Odoo module is installed.
 */
export async function getExportShipments() {
  return execute<Array<Record<string, unknown>>>(
    'x_romerelli.export.shipment',
    'search_read',
    [
      [],
      [
        'name',
        'dus',
        'despacho',
        'booking',
        'sale_order_id',
        'customs_agency_id',
        'container_limit',
        'container_count',
        'state',
      ],
    ],
    { order: 'create_date desc' }
  );
}

/**
 * Get a single shipment with its containers.
 *
 * TODO: Adjust model names after the Odoo module exists.
 */
export async function getExportShipmentDetail(shipmentId: number) {
  const shipments = await execute<Array<Record<string, unknown>>>(
    'x_romerelli.export.shipment',
    'read',
    [
      [shipmentId],
      [
        'name',
        'dus',
        'despacho',
        'booking',
        'sale_order_id',
        'customs_agency_id',
        'container_limit',
        'container_count',
        'state',
        'container_ids',
      ],
    ]
  );

  if (shipments.length === 0) return null;

  const shipment = shipments[0];
  const containerIds = (shipment.container_ids as number[]) || [];

  let containers: Array<Record<string, unknown>> = [];
  if (containerIds.length > 0) {
    containers = await execute<Array<Record<string, unknown>>>(
      'x_romerelli.export.container',
      'read',
      [
        containerIds,
        [
          'picking_id',
          'container_number',
          'seal_number',
          'net_weight',
          'tare_weight',
        ],
      ]
    );
  }

  return { shipment, containers };
}

/**
 * Create a new export shipment.
 */
export async function createExportShipment(data: {
  dus: string;
  despacho: string;
  booking: string;
  saleOrderId: number;
  customsAgencyId: number;
  containerLimit: number;
}): Promise<number> {
  return execute<number>('x_romerelli.export.shipment', 'create', [
    {
      dus: data.dus,
      despacho: data.despacho,
      booking: data.booking,
      sale_order_id: data.saleOrderId,
      customs_agency_id: data.customsAgencyId,
      container_limit: data.containerLimit,
    },
  ]);
}

/**
 * Register a container into an existing shipment.
 */
export async function addContainerToShipment(data: {
  shipmentId: number;
  pickingId: number;
  containerNumber: string;
  sealNumber: string;
  netWeight: number;
  tareWeight: number;
}): Promise<number> {
  return execute<number>('x_romerelli.export.container', 'create', [
    {
      shipment_id: data.shipmentId,
      picking_id: data.pickingId,
      container_number: data.containerNumber,
      seal_number: data.sealNumber,
      net_weight: data.netWeight,
      tare_weight: data.tareWeight,
    },
  ]);
}

// ============================================================
// PUBLIC API — Partner config (fixed price)
// ============================================================

/**
 * Read per-partner fixed price configuration from res.partner.
 * Custom fields: x_fixed_price (boolean), x_fixed_price_value (float).
 */
export async function getPartnerConfig(partnerId: number) {
  const partners = await execute<Array<Record<string, unknown>>>(
    'res.partner',
    'read',
    [[partnerId], ['x_fixed_price', 'x_fixed_price_value']]
  );
  return partners[0] || null;
}

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * Test the Odoo connection. Returns version info if successful.
 */
export async function healthCheck() {
  try {
    const version = await jsonRpc<Record<string, unknown>>(
      `${ODOO_URL}/jsonrpc`,
      'call',
      {
        service: 'common',
        method: 'version',
        args: [],
      }
    );
    const uid = await authenticate();
    return { ok: true, version, uid };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}
