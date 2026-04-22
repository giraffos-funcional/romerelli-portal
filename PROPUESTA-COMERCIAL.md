# Propuesta Comercial — Portal Romerelli

**Cliente**: Romerelli SpA
**Proveedor**: Giraffos SpA — Odoo Silver Partner
**Contacto**: francisco@giraffos.com
**Fecha**: Abril 2026
**Validez de la propuesta**: 30 días

---

## 1. Resumen Ejecutivo

Desarrollo de **Portal Web Romerelli**, una plataforma integrada al ERP Odoo 18 que atiende dos audiencias:

- **Portal Proveedores**: 100+ proveedores consultan facturas, descargan PDF, exportan XLSX
- **Portal Despacho**: 5–8 cajeras crean guías de despacho (traslado, venta nacional, exportación) con workflow admin COMEX / cajera

**Inversión total**: **$12.000.000 CLP + IVA** (~$13.300 USD)
**Tarifa única**: $55.000 CLP/hora
**Plazo**: 6 semanas
**Mantenimiento mensual**: $150.000 CLP (infra + soporte)

---

## 2. Alcance del Proyecto

### 2.1 Portal Proveedores
- Login por RUT con validación contra Odoo
- Dashboard home con KPIs (total facturas, pendientes, pagadas)
- Listado de facturas con filtros (estado pago, rango fechas, búsqueda)
- Detalle de factura con líneas, pesos por producto, totales
- Descarga PDF de factura (generada desde Odoo)
- Exportación XLSX del listado filtrado
- Responsive: desktop, tablet y mobile

### 2.2 Portal Despacho — Guías
- Tres tipos de guía con flujos diferenciados:
  - **Traslado**: sin valor, con selector bodega origen/destino y centro de costo
  - **Venta Nacional**: con precio editable o precio fijo automático por cliente
  - **Exportación**: flujo de 2 roles (admin/cajera)
- Campos comunes de transporte en todas las guías:
  - Peso, Patente, Chofer, Tipo Material, Referencia (N° Ticket)

### 2.3 Portal Despacho — Embarques Exportación
- **Admin COMEX** pre-crea embarques con DUS, Despacho, Booking, OV, Agencia Aduana, límite de contenedores
- **Cajera** selecciona embarque y llena solo: N° Contenedor, N° Sello, Peso Neto, Tara
- Validación automática: rechazo si se supera el límite de contenedores
- Vista detalle de embarque con tabla de contenedores registrados

### 2.4 Autenticación y Roles
- Login separado para proveedores (RUT) y personal despacho (usuario/password)
- 3 roles: proveedor, cajera, admin COMEX
- Navegación filtrada por rol (cada uno ve solo sus módulos)
- Switcher de empresa (multi-empresa: Romerelli SpA / Exportaciones)
- Session segura con cookies firmadas HMAC-SHA256
- Rate limiting contra brute-force

### 2.5 Módulo Odoo Custom (`romerelli_portal`)
- Modelos nuevos:
  - `x_romerelli.export.shipment` — embarques con DUS, booking, estados
  - `x_romerelli.export.container` — contenedores vinculados a guías
- Extensiones:
  - `res.partner`: campos `x_fixed_price`, `x_fixed_price_value`
  - `stock.picking`: `x_peso`, `x_patente`, `x_chofer`, `x_tipo_material`, `x_referencia`
- Reportes QWeb: guía despacho + embarque
- Security: grupos "Portal Cajera" y "Portal Admin COMEX" con ACLs
- Integración SII para DTE tipo 52 (guía despacho electrónica)

### 2.6 Infraestructura y Deploy
- Servidor VPS con Coolify para orquestación
- Docker multi-stage optimizado
- DNS Cloudflare con SSL automático
- Dominio `romerelli.giraffos.com` (o personalizado a pedido)
- Backups automáticos
- Monitoreo básico de uptime

### 2.7 Entregables Adicionales
- Plan de pruebas con 93 casos documentados
- Script de smoke tests automatizado
- Documentación técnica de integración
- Manual de usuario para cajeras y admin
- Capacitación en vivo (2 sesiones de 1h)

---

## 3. Detalle de Inversión

**Tarifa única**: $55.000 CLP/hora (todos los perfiles)

### 3.1 Desarrollo — 188 horas

| Fase | Horas | Subtotal CLP |
|------|-------|--------------|
| **Análisis y arquitectura** | 10 | $550.000 |
| Relevamiento + diseño arquitectura | | |
| **Infraestructura y Seguridad** | 17 | $935.000 |
| Setup VPS, Docker, Coolify, DNS, SSL | 12 | |
| Seguridad (HMAC, rate limit, HTTPS) | 5 | |
| **Portal Frontend** | 84 | $4.620.000 |
| Portal Proveedores (home, facturas, detalle, PDF, XLSX) | 28 | |
| Portal Despacho — Guías (3 tipos) | 24 | |
| Portal Despacho — Embarques (admin/cajera) | 14 | |
| Auth multi-rol + Multi-empresa | 10 | |
| UI/UX responsive + pulido | 8 | |
| **Backend / API** | 12 | $660.000 |
| API routes Next.js + integraciones | | |
| **Módulo Odoo Custom** | 31 | $1.705.000 |
| Modelos export shipment/container | 10 | |
| Extensiones res.partner / stock.picking | 5 | |
| Vistas XML + menús + security | 9 | |
| Reportes QWeb (guía + embarque) | 4 | |
| Tests unitarios Odoo | 3 | |
| **Integración SII** | 5 | $275.000 |
| DTE tipo 52 (guía despacho electrónica) | | |
| **Integración Portal ↔ Odoo** | 14 | $770.000 |
| Conectar API routes con Odoo JSON-RPC | 10 | |
| Testing end-to-end con data real | 4 | |
| **QA y Testing** | 8 | $440.000 |
| Plan de pruebas + script automatizado | 4 | |
| Ejecución QA manual + regresión | 4 | |
| **Gestión y Cliente** | 14 | $770.000 |
| Reuniones, ajustes post-feedback, PM | | |
| **Go-Live y Training** | 3 | $165.000 |
| Deploy producción + capacitación | | |
| **SUBTOTAL DESARROLLO** | **188 h** | **$10.340.000** |

### 3.2 Contingencia y Buffer (15%)

Previsto para cambios de scope razonables, troubleshooting y ajustes finales.

| Concepto | Subtotal CLP |
|----------|--------------|
| Buffer proyecto (+15% ≈ 28 h) | $1.551.000 |

### 3.3 Resumen Inversión

| Concepto | CLP |
|----------|-----|
| Desarrollo (188 h × $55.000) | $10.340.000 |
| Buffer (+15%) | $1.551.000 |
| **Subtotal** | **$11.891.000** |
| Ajuste comercial | $109.000 |
| **TOTAL PROYECTO (neto)** | **$12.000.000 CLP** |
| **TOTAL + IVA (19%)** | **$14.280.000 CLP** |
| Equivalente USD (TC $900) | ~$15.900 USD |

---

## 4. Infraestructura — Costo Recurrente

Una vez entregado, el sistema requiere infraestructura mensual:

| Servicio | Costo Mensual CLP |
|----------|-------------------|
| VPS servidor (2 vCPU, 4GB RAM, SSD 40GB) | $35.000 |
| Dominio `.com` (prorrateado) | $1.500 |
| Backups off-site automáticos | $12.000 |
| Monitoreo uptime + alertas | $12.500 |
| Soporte técnico (hasta 2 h/mes) | $110.000 |
| **TOTAL MENSUAL** | **$171.000 CLP + IVA** |
| **Tarifa comercial** | **$150.000 CLP + IVA** |

*Horas adicionales de soporte sobre las 2h incluidas: $55.000/h.*

---

## 5. Plan de Pagos Propuesto

| Hito | % | Monto CLP (neto) |
|------|---|------------------|
| **Hito 1** — Firma contrato + inicio | 30% | $3.600.000 |
| **Hito 2** — Demo funcional portal (semana 3) | 30% | $3.600.000 |
| **Hito 3** — Integración Odoo lista en staging (semana 5) | 25% | $3.000.000 |
| **Hito 4** — Go-live producción + capacitación | 15% | $1.800.000 |
| **TOTAL** | 100% | **$12.000.000** |

---

## 6. Cronograma

| Semana | Actividad | Entregable |
|--------|-----------|------------|
| 1 | Kickoff + relevamiento + arquitectura | Documento de arquitectura |
| 2 | Setup infra + portal proveedores | Portal proveedores demo |
| 3 | Portal despacho + embarques | **DEMO completa al cliente** (Hito 2) |
| 4 | Módulo Odoo custom | Módulo en staging |
| 5 | Integración SII + Portal-Odoo | **Staging integrado** (Hito 3) |
| 6 | QA + hardening + training + go-live | **Producción + capacitación** (Hito 4) |

---

## 7. Supuestos y Condiciones

**Incluye**:
- Desarrollo completo descrito en sección 2
- 2 rondas de ajustes menores post-demo
- 2 sesiones de capacitación de 1 hora
- Soporte gratuito durante 30 días post go-live
- Garantía de bugs críticos por 90 días

**No incluye** (cotización aparte):
- Migración de datos históricos masivos (> 1.000 guías pre-existentes)
- Integración con sistemas legacy distintos a Odoo 18
- Cambios estructurales de modelo de datos post-aprobación de arquitectura
- Desarrollo de apps móviles nativas (el portal es responsive pero no app)
- Licencias de Odoo Enterprise (si aplica)
- Hardware físico (balanza, impresoras, etc.)

**Requisitos del Cliente**:
- Acceso admin a instancia Odoo 18 productiva
- Usuario/API key de Odoo con permisos `Technical Settings`
- Información de folios CAF del SII para DTE tipo 52
- Asignación de un contraparte técnica para validaciones
- Disponibilidad para 2 sesiones de 1h de capacitación
- Aprobación de cambios en no más de 5 días hábiles

---

## 8. Garantías

- **Bugs críticos** (sistema inoperable): corrección en < 8 horas por 90 días
- **Bugs mayores** (funcionalidad afectada): corrección en < 48 horas por 60 días
- **Bugs menores** (cosmética, UX): corrección en siguiente sprint por 30 días

Fuera del período de garantía, soporte se cotiza por hora.

---

## 9. Próximos Pasos

1. **Aprobación de propuesta** y firma de contrato
2. **Pago Hito 1** (30% — $3.600.000 + IVA)
3. **Kickoff meeting** dentro de 3 días hábiles
4. **Inicio desarrollo** en semana 1

---

## 10. ¿Por qué Giraffos?

- **Odoo Silver Partner** oficial
- Experiencia especializada en clientes chilenos con SII
- Stack moderno: Next.js 16, TypeScript, PostgreSQL
- Infraestructura propia Coolify (GiraffosSH)
- Entregas trunk-based con despliegues continuos
- Plan de pruebas documentado (93 casos)
- Código fuente propiedad del cliente al finalizar

---

**¿Preguntas o ajustes?**

francisco@giraffos.com
+56 9 XXXX XXXX
giraffos.com

*Propuesta preparada exclusivamente para Romerelli SpA.*
