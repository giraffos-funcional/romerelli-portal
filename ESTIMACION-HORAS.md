# Estimación de Horas — Portal Romerelli

Documento de estimación de esfuerzo (en horas-hombre) para el desarrollo completo del Portal Romerelli, considerando trabajo ya realizado y pendiente.

**Fecha**: Abril 2026
**Versión**: 1.0

---

## Resumen Ejecutivo

| Concepto | Horas | % |
|----------|-------|---|
| Trabajo Realizado (Portal + Infra) | **98 h** | 52% |
| Trabajo Pendiente (Odoo + Validación) | **90 h** | 48% |
| **TOTAL PROYECTO** | **188 h** | 100% |

**Duración estimada**: 4–6 semanas con 1 desarrollador senior + 1 consultor Odoo part-time.

---

## 1. TRABAJO REALIZADO (98 horas)

### 1.1 Infraestructura y Setup Inicial (12 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Setup proyecto Next.js 16 | 2 | Scaffold, TypeScript, Tailwind 4, estructura de carpetas |
| Configuración Docker | 3 | Dockerfile multi-stage, .dockerignore, optimización de build |
| Deploy Coolify | 2 | Creación app, env vars, build pack, healthcheck |
| DNS Cloudflare | 1 | A record, SSL automatico Let's Encrypt via Traefik |
| Git workflow | 1 | Repo GitHub, conventional commits, CI implícito |
| Setup env vars y secrets | 2 | SESSION_SECRET, variables Odoo preparadas |
| Troubleshooting deploy | 1 | Debugging de devDependencies en Docker, healthcheck |

**Subtotal: 12 h**

### 1.2 Arquitectura y Seguridad (8 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Diseño arquitectura portal | 2 | Modelo demo/producción dual, estructura API routes |
| Session management HMAC-SHA256 | 3 | Cookies firmadas con timing-safe comparison, 8h TTL |
| Rate limiting | 1 | Sliding window in-memory, 10 req/60s por IP |
| Prompt injection defense | 1 | Validaciones input, sanitización |
| CSP / headers seguridad | 1 | HSTS via Coolify, httpOnly cookies |

**Subtotal: 8 h**

### 1.3 Portal Proveedores — MVP (14 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Login con RUT | 2 | Validación RUT Chileno, normalización, demo mode |
| Home dashboard | 2 | KPI cards, bloques de módulos, stats aggregation |
| Listado facturas | 3 | Tabla desktop + cards mobile, paginación, skeleton |
| Filtros y búsqueda | 2 | Estado pago, fecha desde/hasta, búsqueda texto |
| Detalle factura | 2 | Header, 5 summary cards, tabla líneas, mobile cards |
| Componentes UI reutilizables | 2 | PaymentBadge, SearchSelect, skeleton loaders |
| Error pages + metadata | 1 | 404, 500, title templates, favicon SVG |

**Subtotal: 14 h**

### 1.4 Guías de Despacho MVP (16 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Tipos de guía (transfer/national/export) | 2 | Cards selector, routing por tipo |
| Formulario base | 4 | Validaciones, estado complejo, submit |
| Componente ProductLines | 3 | CRUD líneas, precio fijo, cálculos |
| Componente SearchSelect | 2 | Autocomplete debounced con API |
| Página de éxito | 1 | Confirmación con número de guía |
| API dispatch POST/GET | 2 | Validaciones backend, demo mode |
| Navegación y breadcrumbs | 2 | Active links, back buttons, layout |

**Subtotal: 16 h**

### 1.5 Fase 1 — Mejoras Post-Encuesta Cliente (10 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Análisis encuesta cliente | 1 | Identificar gaps, priorizar |
| 5 campos transporte | 3 | Componente TransportFields, material types API |
| Peso en detalle factura | 2 | Columna tabla, card total, mobile cards |
| PDF download endpoint | 2 | Generación PDF placeholder demo, stub Odoo |
| XLSX export facturas | 2 | Endpoint con filtros, download |

**Subtotal: 10 h**

### 1.6 Fase 2 — Rediseño Exportación (14 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Diseño flujo admin/cajera | 2 | Modelo datos, separación responsabilidades |
| Modelo demo export shipments | 2 | Interfaces, seed data, counter, enforce limits |
| API embarques CRUD | 2 | GET list/detail, POST create |
| Pages admin embarques | 4 | Listado, crear, detalle con contenedores |
| Formulario cajera redesigned | 2 | ShipmentSelect, ContainerFields |
| Integración dispatch + shipment | 2 | Container add, límite enforcement, 207 partial |

**Subtotal: 14 h**

### 1.7 Fase 3 — Auth Multi-Rol + Multi-Empresa (10 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Login dispatch separado | 2 | Página login, auth endpoint, roles |
| Session con rol + empresa | 1 | Extender PortalSession, backward compatible |
| Nav filtrado por rol | 2 | Proveedor/cajera/admin_comex ven distinto |
| Company switcher | 2 | Dropdown, switch-company API, reload |
| Precio fijo por cliente | 2 | Auto-detect partner, badge no editable |
| Partner config endpoint | 1 | GET /api/partners/[id]/config |

**Subtotal: 10 h**

### 1.8 Fase 4 — Preparación Odoo (8 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Selectores bodega/centro costo | 2 | Solo para transfer, endpoints stub |
| odoo-client.ts extensión | 3 | 10+ métodos nuevos con signatures finales |
| API routes production branches | 2 | Try/catch + fallback 503, demo preservado |
| Endpoint partner fixed price | 1 | Lookup de x_fixed_price en Odoo |

**Subtotal: 8 h**

### 1.9 Testing y QA (4 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| Plan de pruebas documentado | 1 | 93 casos en PLAN-DE-PRUEBAS.md |
| Script automatizado smoke tests | 2 | 55 tests bash curl contra producción |
| Ejecución + análisis resultados | 1 | 53/55 passing, documentar fallos esperados |

**Subtotal: 4 h**

### 1.10 Documentación (2 h)

| Tarea | Horas | Descripción |
|-------|-------|-------------|
| INTEGRACION-ODOO.md | 1 | Guía activación producción |
| .env.example + README | 0.5 | Variables documentadas |
| Commits descriptivos | 0.5 | Historia Git legible |

**Subtotal: 2 h**

### RESUMEN TRABAJO REALIZADO

| Seccion | Horas |
|---------|-------|
| 1.1 Infraestructura | 12 |
| 1.2 Arquitectura + Seguridad | 8 |
| 1.3 Portal Proveedores MVP | 14 |
| 1.4 Despacho MVP | 16 |
| 1.5 Fase 1 (post-encuesta) | 10 |
| 1.6 Fase 2 (exportación) | 14 |
| 1.7 Fase 3 (auth + multi-empresa) | 10 |
| 1.8 Fase 4 (prep Odoo) | 8 |
| 1.9 Testing | 4 |
| 1.10 Documentación | 2 |
| **TOTAL REALIZADO** | **98 h** |

---

## 2. TRABAJO PENDIENTE (90 horas)

### 2.1 Módulo Odoo Custom (40 h) — *Bloqueante*

Desarrollo del módulo `romerelli_portal` en Odoo 18.

| Tarea | Horas | Agente/Rol |
|-------|-------|------------|
| **Setup módulo** | 2 | `giraffos-odoo-developer` |
| __init__.py, __manifest__.py, estructura base | | |
| **Modelo x_romerelli.export.shipment** | 6 | |
| Campos (DUS, despacho, booking, OV, agencia, límite) | | |
| Estados (draft, active, closed) | | |
| Computed field container_count | | |
| Métodos action_activate, action_close | | |
| **Modelo x_romerelli.export.container** | 4 | |
| Campos + constraints + relación shipment | | |
| Constraint: shipment no cerrado | | |
| **Campos custom res.partner** | 2 | |
| x_fixed_price, x_fixed_price_value | | |
| Vista form + tree extension | | |
| **Campos custom stock.picking** | 3 | |
| x_peso, x_patente, x_chofer, x_tipo_material, x_referencia | | |
| Campo computed x_container_info para export | | |
| **Modelo x_romerelli.material.type** | 2 | |
| Datos iniciales (11 tipos) | | |
| **Vistas XML** | 6 | |
| Formulario embarques, tree, search | | |
| Menu tree bajo Inventario/Comercio Exterior | | |
| Kanban para estados | | |
| **Security** | 3 | |
| Grupo "Portal Cajera", "Portal Admin COMEX" | | |
| ir.model.access.csv para todos los modelos | | |
| Record rules por company_id | | |
| **Reportes QWeb** | 4 | `giraffos-odoo-developer` |
| Reporte guía despacho con campos custom | | |
| Reporte embarque con contenedores | | |
| **Integración SII DTE tipo 52** | 5 | `giraffos-chile-compliance` |
| Extender account.move o stock.picking para DTE | | |
| Folio CAF, firma digital, envío SII | | |
| **Tests unitarios** | 3 | |
| Python tests básicos (Odoo TransactionCase) | | |

**Subtotal: 40 h**

### 2.2 Deployment Módulo Odoo (6 h)

| Tarea | Horas |
|-------|-------|
| Instalar módulo en staging Odoo | 1 |
| Cargar data inicial (tipos material, bodegas) | 1 |
| Configurar usuarios y grupos | 2 |
| Migrar data histórica si aplica | 2 |

**Subtotal: 6 h**

### 2.3 Integración Portal ↔ Odoo (14 h)

| Tarea | Horas |
|-------|-------|
| Validación API key + troubleshooting auth | 2 |
| Ajustar nombres de modelos (x_ vs custom) | 2 |
| Implementar getInvoicePdf real (report service) | 3 |
| Testing en cada endpoint con Odoo real | 4 |
| Corrección de mapeos de campos | 2 |
| Smoke tests end-to-end con data real | 1 |

**Subtotal: 14 h**

### 2.4 Ajustes Post-Validación Cliente (12 h)

Basado en feedback que dará Luis al probar el demo.

| Tarea | Horas |
|-------|-------|
| Reunión demo con cliente | 2 |
| Compilar feedback y priorizar | 1 |
| Ajustes de campos/flujos según feedback | 6 |
| Re-validación con cliente | 2 |
| Traducciones/textos finales en es_CL | 1 |

**Subtotal: 12 h**

### 2.5 Features Secundarios (10 h)

| Tarea | Horas |
|-------|-------|
| Estado de cuenta proveedores | 4 |
| Reset password proveedores | 2 |
| Notificaciones email (factura nueva, guía creada) | 3 |
| Audit log simple (quién creó qué) | 1 |

**Subtotal: 10 h**

### 2.6 Hardening Producción (5 h)

| Tarea | Horas |
|-------|-------|
| Monitoreo (Sentry o similar) | 2 |
| Logs estructurados + rotation | 1 |
| Backup strategy para Odoo | 1 |
| Alertas Coolify uptime | 1 |

**Subtotal: 5 h**

### 2.7 Training y Go-Live (3 h)

| Tarea | Horas |
|-------|-------|
| Capacitación cajeras (sesión 1h) | 1 |
| Capacitación admin COMEX | 1 |
| Documentación usuario final | 1 |

**Subtotal: 3 h**

### RESUMEN TRABAJO PENDIENTE

| Seccion | Horas |
|---------|-------|
| 2.1 Módulo Odoo custom | 40 |
| 2.2 Deployment módulo | 6 |
| 2.3 Integración Portal-Odoo | 14 |
| 2.4 Ajustes post-validación | 12 |
| 2.5 Features secundarios | 10 |
| 2.6 Hardening producción | 5 |
| 2.7 Training y go-live | 3 |
| **TOTAL PENDIENTE** | **90 h** |

---

## 3. DISTRIBUCIÓN POR ROL

| Rol | Horas Realizadas | Horas Pendientes | Total |
|-----|------------------|------------------|-------|
| Full-stack Developer (Next.js) | 78 | 26 | 104 |
| DevOps / Infra | 12 | 5 | 17 |
| Odoo Developer | 0 | 40 | 40 |
| Compliance Chile (SII) | 0 | 5 | 5 |
| QA / Testing | 4 | 4 | 8 |
| Project Management / Cliente | 4 | 10 | 14 |
| **TOTAL** | **98** | **90** | **188** |

---

## 4. ESTIMACIÓN DE COSTO

**Tarifas referenciales (Giraffos, Chile)**:

| Rol | Tarifa hora (CLP) | Tarifa hora (USD) |
|-----|-------------------|-------------------|
| Full-stack Developer Senior | $45.000 | ~$50 |
| DevOps Engineer | $50.000 | ~$55 |
| Odoo Developer Senior | $50.000 | ~$55 |
| Chile SII Compliance | $60.000 | ~$65 |
| QA Engineer | $30.000 | ~$33 |
| Project Manager | $40.000 | ~$44 |

### Costo Total Estimado

| Rol | Horas | Tarifa CLP | Subtotal CLP |
|-----|-------|------------|--------------|
| Full-stack Dev | 104 | $45.000 | $4.680.000 |
| DevOps | 17 | $50.000 | $850.000 |
| Odoo Dev | 40 | $50.000 | $2.000.000 |
| Chile Compliance | 5 | $60.000 | $300.000 |
| QA | 8 | $30.000 | $240.000 |
| PM | 14 | $40.000 | $560.000 |
| **TOTAL** | **188 h** | | **$8.630.000 CLP** |
| | | | **~$9.600 USD** |

*Tarifas antes de IVA. No incluye infraestructura recurrente.*

### Costo de Infraestructura (mensual)

| Servicio | Costo mensual (USD) |
|----------|---------------------|
| VPS Coolify (2 vCPU, 4GB RAM) | $20 |
| Dominio .com anual (prorrateado) | $1 |
| Cloudflare (free tier) | $0 |
| Backups externos (opcional) | $5 |
| Monitoring/Sentry (free tier) | $0 |
| **TOTAL MENSUAL** | **$26 USD** (~$23.000 CLP) |

---

## 5. CRONOGRAMA SUGERIDO

| Semana | Actividad | Horas |
|--------|-----------|-------|
| 0 | **Demo con cliente** (ya tienes el portal live) | 2 |
| 1 | Ajustes post-feedback + Setup módulo Odoo | 20 |
| 2 | Desarrollo módulo Odoo (modelos + vistas) | 25 |
| 3 | Integración SII + Reportes + Tests | 20 |
| 4 | Integración Portal-Odoo + troubleshooting | 15 |
| 5 | Features secundarios + hardening | 15 |
| 6 | Training + go-live + soporte post-lanzamiento | 10 |
| | **TOTAL PENDIENTE** | **107 h** |

*La suma de 107h incluye algo de buffer sobre las 90h estimadas.*

---

## 6. RIESGOS Y CONTINGENCIAS

| Riesgo | Probabilidad | Impacto (h) | Mitigación |
|--------|--------------|-------------|------------|
| API key Odoo inválida o sin permisos | Alta | +4 h | Resolver antes de iniciar Fase 2.3 |
| SII DTE tipo 52 requiere config extra | Media | +8 h | Reservar al experto Chile compliance |
| Cambios de scope post-demo | Alta | +10 h | Incluido en 2.4 |
| Migración datos históricos complejos | Media | +15 h | Evaluar con cliente, considerar scope separado |
| Performance issues con >1000 facturas | Baja | +6 h | Agregar paginación/caching si ocurre |

**Buffer recomendado**: +15% (~14 horas) = **202 horas totales con contingencia**.

---

## 7. DECISIONES CLAVE PARA EL CLIENTE

Antes de arrancar el pendiente, necesitamos respuesta a:

1. ¿Cuándo se puede reunir Luis para ver el demo?
2. ¿Tienen ya el ambiente Odoo 18 productivo o es staging?
3. ¿Manejan folios CAF del SII? (Necesario para DTE tipo 52)
4. ¿Los 5-8 cajeras serán usuarios Odoo reales o credenciales propias del portal?
5. ¿Multi-empresa es requisito de día 1 o puede ser fase 2?
6. ¿Quieren migración de históricos o partir desde cero?

---

**Preparado por**: Giraffos
**Cliente**: Romerelli SpA
**Contacto**: francisco@giraffos.com
