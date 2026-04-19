// Odoo model types for the Romerelli Portal

export interface OdooInvoice {
  id: number;
  name: string;
  partner_id: [number, string];
  invoice_date: string | false;
  date: string | false;
  amount_total: number;
  amount_residual: number;
  amount_untaxed: number;
  amount_tax: number;
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed' | 'invoicing_legacy';
  state: 'draft' | 'posted' | 'cancel';
  move_type: 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund' | 'entry';
  l10n_latam_document_type_id: [number, string] | false;
  l10n_latam_document_number: string | false;
  currency_id: [number, string];
  ref: string | false;
  invoice_line_ids: number[];
}

export interface OdooInvoiceLine {
  id: number;
  name: string;
  product_id: [number, string] | false;
  quantity: number;
  price_unit: number;
  price_subtotal: number;
  price_total: number;
  tax_ids: number[];
  display_type: string;
}

export interface OdooPartner {
  id: number;
  name: string;
  vat: string | false;
  email: string | false;
  phone: string | false;
  street: string | false;
  city: string | false;
  country_id: [number, string] | false;
}

export interface OdooSaleOrder {
  id: number;
  name: string;
  partner_id: [number, string];
  date_order: string;
  state: string;
  amount_total: number;
  order_line: number[];
}

export interface OdooProduct {
  id: number;
  name: string;
  default_code: string | false;
  uom_id: [number, string];
}

export interface PortalUser {
  partnerId: number;
  partnerName: string;
  vat: string;
  email: string;
  type: 'vendor' | 'dispatch';
}

export type DispatchGuideType = 'export' | 'national' | 'transfer';

export interface DispatchGuide {
  guideType: DispatchGuideType;
  partnerId: number;
  warehouseId?: number;
  dateDispatch: string;
  notes?: string;
  // Export specific
  saleOrderId?: number;
  customsAgencyId?: number;
  destinationCountryId?: number;
  // National specific
  useFixedPrice?: boolean;
  // Lines
  lines: DispatchGuideLine[];
}

export interface DispatchGuideLine {
  productId: number;
  description: string;
  quantity: number;
  uomId: number;
  priceUnit: number;
}
