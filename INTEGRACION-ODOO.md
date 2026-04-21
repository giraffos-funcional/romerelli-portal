# Integracion con Odoo — Portal Romerelli

Este documento describe el estado de la integracion entre el portal Next.js
y Odoo, y los pasos necesarios para habilitarla en produccion.

## 1. Status actual

### Lo que ya esta listo
- Portal Next.js **100% funcional en modo demo**. Todas las rutas API
  (`/api/invoices`, `/api/dispatch`, `/api/export-shipments`, etc.) responden
  con datos simulados cuando la sesion tiene `partnerId === 9999`.
- Cliente Odoo (`src/lib/odoo-client.ts`) con todos los metodos necesarios
  para el portal (facturas, guias de despacho, embarques de exportacion,
  bodegas, centros de costo, empresas, configuracion de partner).
- Todas las rutas API tienen ya escrita la rama de **produccion** que llama
  al cliente Odoo cuando `partnerId !== 9999`. La conmutacion demo/produccion
  es transparente.
- Autenticacion por `vat` (RUT) via `res.partner` con `supplier_rank > 0`.

### Lo que falta para activar produccion
1. **API key valida** de un usuario de Odoo con permisos sobre
   `res.partner`, `account.move`, `stock.picking`, `sale.order`, etc.
2. **Modulo custom Odoo** `x_romerelli_portal` instalado (detalle en la
   seccion 3).
3. **Variables de entorno** en `.env.local` (ver seccion 2).
4. **Validar endpoint de PDF**: `getInvoicePdf()` esta stub. Requiere
   decidir el flujo de autenticacion (cookie de sesion web vs. API key) y
   probar contra una instancia Odoo real.

## 2. Variables de entorno

| Variable         | Descripcion                                       | Ejemplo |
|------------------|---------------------------------------------------|---------|
| `ODOO_URL`       | URL base de la instancia Odoo                     | `https://odoo.romerelli.cl` |
| `ODOO_DB`        | Nombre de la base de datos Odoo                   | `romerelli_prod` |
| `ODOO_API_USER`  | Login del usuario que ejecuta las llamadas        | `portal@romerelli.cl` |
| `ODOO_API_KEY`   | API key del usuario (Odoo 14+)                    | `xxxxxxxxxxxxxxxx` |
| `SESSION_SECRET` | Secreto HMAC para firmar las cookies de sesion. Generar con `openssl rand -hex 32` | `a1b2c3...` |
| `NODE_ENV`       | `production` en despliegues reales                | `production` |

Ver archivo `.env.example` en la raiz.

## 3. Modulo Odoo requerido (`x_romerelli_portal`)

Se requiere un modulo custom que agregue los siguientes modelos y campos.
Los nombres de campo en el portal asumen la convencion `x_` de Odoo Studio
/ campos custom; si se implementa como modulo Python, mantener los mismos
technical names para no tocar el cliente.

### 3.1. Modelos nuevos

#### `x_romerelli.export.shipment`
Cabecera del embarque de exportacion.

| Campo                | Tipo         | Notas |
|----------------------|--------------|-------|
| `name`               | Char         | Secuencia `EMB-00001` |
| `dus`                | Char         | Numero DUS |
| `despacho`           | Char         | Numero de despacho |
| `booking`            | Char         | Numero de reserva / booking |
| `sale_order_id`      | Many2one `sale.order` | OC asociada |
| `customs_agency_id`  | Many2one `res.partner` | Agencia de aduana |
| `container_limit`    | Integer      | Maximo de contenedores |
| `container_count`    | Integer (computed) | `len(container_ids)` |
| `container_ids`      | One2many `x_romerelli.export.container` | |
| `state`              | Selection    | `draft` / `active` / `closed` |

#### `x_romerelli.export.container`
Detalle de cada contenedor cargado en un embarque.

| Campo             | Tipo         | Notas |
|-------------------|--------------|-------|
| `shipment_id`     | Many2one `x_romerelli.export.shipment` | |
| `picking_id`      | Many2one `stock.picking` | Guia de despacho que lo genera |
| `container_number`| Char         | |
| `seal_number`     | Char         | |
| `net_weight`      | Float        | kg |
| `tare_weight`     | Float        | kg |

### 3.2. Campos adicionales en modelos existentes

#### `res.partner`
| Campo                 | Tipo    | Notas |
|-----------------------|---------|-------|
| `x_fixed_price`       | Boolean | Indica si aplica precio fijo |
| `x_fixed_price_value` | Float   | Valor de precio fijo (moneda local) |

#### `stock.picking`
| Campo              | Tipo      | Notas |
|--------------------|-----------|-------|
| `x_peso`           | Float     | Peso declarado (kg) |
| `x_patente`        | Char      | Patente del vehiculo |
| `x_chofer`         | Char      | Nombre del chofer |
| `x_tipo_material`  | Selection | Tipo de material (ver lista hardcoded en `/api/material-types`) |
| `x_referencia`     | Char      | Referencia libre |

### 3.3. Opcional — `x_romerelli.material.type`
Si se prefiere un modelo en lugar de selection para tipos de material,
crear `x_romerelli.material.type` con `name` y `code`. El cliente ya
expone `getMaterialTypes()`; hoy retorna `[]` y la ruta cae al listado
hardcoded.

## 4. Checklist para activar produccion

- [ ] Obtener API key valida (Odoo → Preferencias → Cuenta → API Keys)
- [ ] Instalar modulo custom `x_romerelli_portal` en Odoo
- [ ] Validar que el usuario de API tiene acceso a: `res.partner`,
      `account.move`, `account.move.line`, `stock.picking`,
      `stock.picking.type`, `stock.warehouse`, `sale.order`,
      `product.product`, `account.analytic.account`, `res.company`,
      `x_romerelli.export.shipment`, `x_romerelli.export.container`
- [ ] Configurar `.env.local` a partir de `.env.example`
- [ ] `npm run build` sin errores
- [ ] Probar health check: `curl https://<portal>/api/health`
- [ ] Crear usuarios proveedores con `supplier_rank > 0` y RUT en `vat`
- [ ] Decidir manejo de usuarios internos (cajera, admin_comex):
      mantener hardcoded en el endpoint de login demo, o crear usuarios
      Odoo dedicados
- [ ] Implementar `getInvoicePdf()` (endpoint `/report/pdf/account.report_invoice/<id>`)
- [ ] Validar multi-empresa en `/api/auth/switch-company` usando
      `getAllowedCompanies(uid)`

## 5. Estado de endpoints

| Endpoint                              | Demo | Produccion       | Notas |
|---------------------------------------|------|------------------|-------|
| `GET /api/health`                     | OK   | OK               | |
| `POST /api/auth/login`                | OK   | OK (via vat)     | |
| `POST /api/auth/demo`                 | OK   | N/A              | Solo demo |
| `POST /api/auth/logout`               | OK   | OK               | |
| `POST /api/auth/switch-company`       | OK   | **TODO**         | Validar contra `allowed_company_ids` real |
| `GET  /api/invoices`                  | OK   | OK               | |
| `GET  /api/invoices/[id]`             | OK   | OK               | |
| `GET  /api/invoices/[id]/pdf`         | OK   | **STUB**         | `getInvoicePdf()` no implementado |
| `GET  /api/invoices/export`           | OK   | OK (existente)   | |
| `GET  /api/dispatch`                  | OK   | Parcial          | Listado prod devuelve `[]` — falta query |
| `POST /api/dispatch`                  | OK   | OK               | Envia `x_peso`, `x_patente`, `x_chofer`, `x_tipo_material`, `x_referencia` |
| `GET  /api/export-shipments`          | OK   | OK               | |
| `POST /api/export-shipments`          | OK   | OK               | |
| `GET  /api/export-shipments/[id]`     | OK   | OK               | |
| `GET  /api/warehouses`                | OK   | OK               | |
| `GET  /api/cost-centers`              | OK   | OK               | |
| `GET  /api/material-types`            | OK   | Fallback         | Usa hardcoded mientras Odoo retorne `[]` |
| `GET  /api/partners`                  | OK   | OK               | |
| `GET  /api/partners/[id]/config`      | OK   | OK               | Lee `x_fixed_price` / `x_fixed_price_value` |
| `GET  /api/products`                  | OK   | OK               | |
| `GET  /api/sale-orders`               | OK   | OK               | |

## 6. Pruebas post-conexion (smoke tests)

Ejecutar en este orden con variables de entorno apuntando a la instancia
de staging / produccion:

1. **Health check**
   ```bash
   curl -s https://<portal>/api/health | jq
   ```
   Debe retornar `{ ok: true, version: {...}, uid: <num> }`.

2. **Login real** (usuario proveedor existente en Odoo)
   ```bash
   curl -s -X POST https://<portal>/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"vat":"76.123.456-7","password":"..."}'
   ```

3. **Listar facturas del proveedor autenticado**
   ```bash
   curl -s https://<portal>/api/invoices --cookie cookies.txt | jq '.total, .invoices[0]'
   ```

4. **Listar bodegas / centros de costo / partners / productos**
   - `GET /api/warehouses` → array con `stock.warehouse`
   - `GET /api/cost-centers` → array con `account.analytic.account` activos
   - `GET /api/partners?q=codelco&isCustomer=true` → filtrado
   - `GET /api/products?q=cobre` → filtrado

5. **Crear guia de despacho (nacional)**
   ```bash
   curl -s -X POST https://<portal>/api/dispatch \
     -H 'Content-Type: application/json' \
     --cookie cookies.txt \
     -d '{
       "guideType":"national","partnerId":<id>,"dateDispatch":"2026-04-20",
       "lines":[{"productId":<id>,"quantity":100,"uomId":1}],
       "peso":1000,"patente":"AB-CD-12","chofer":"Juan Perez","tipoMaterial":"chatarra_cobre"
     }'
   ```
   Verificar en Odoo que el picking se creo con los campos `x_*` poblados.

6. **Crear embarque y agregar contenedor**
   - `POST /api/export-shipments` → verificar `x_romerelli.export.shipment`
   - `POST /api/dispatch` con `guideType=export` + `shipmentId` →
     verificar `x_romerelli.export.container` asociado al shipment.

7. **Config partner con precio fijo**
   - `GET /api/partners/<id>/config` →
     `{ fixedPrice: boolean, fixedPriceValue: number }`.

---

**Mantenedor**: Giraffos — integracion Odoo.
