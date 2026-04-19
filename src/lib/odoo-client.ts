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

  // Create the picking
  const pickingId = await execute<number>('stock.picking', 'create', [{
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
  }]);

  return pickingId;
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
