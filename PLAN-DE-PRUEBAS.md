# Plan de Pruebas — Portal Romerelli

## Resumen

| Modulo | Casos | Prioridad |
|--------|-------|-----------|
| Autenticacion | 14 | Alta |
| Portal Proveedores (Facturas) | 16 | Alta |
| Guias de Despacho | 22 | Alta |
| Embarques Exportacion | 12 | Alta |
| Navegacion y Roles | 10 | Media |
| Multi-Empresa | 5 | Media |
| Responsividad | 6 | Media |
| Seguridad | 8 | Alta |

**Total: 93 casos de prueba**

---

## 1. AUTENTICACION

### 1.1 Login Proveedor (`/login`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| A01 | Login demo exitoso | Click "Ingresar como Demo" | Redirige a `/portal`, muestra "Proveedor Demo S.A." en nav |
| A02 | Login RUT valido | Ingresar "76.123.456-7", submit | Redirige a `/portal` |
| A03 | Login RUT sin puntos | Ingresar "76123456-7" | Funciona igual (normaliza formato) |
| A04 | Login RUT invalido | Ingresar "11.111.111-1" | Muestra error "RUT no encontrado" |
| A05 | Login campo vacio | Submit sin ingresar RUT | Validacion HTML required |
| A06 | Rate limit | 11 intentos rapidos | Error 429 en intento 11 |

### 1.2 Login Despacho (`/login/dispatch`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| A07 | Login cajera | User: "cajera1", Pass: "demo123" | Redirige a `/portal/dispatch`, rol cajera |
| A08 | Login admin comex | User: "admin.comex", Pass: "demo123" | Redirige a `/portal/dispatch`, ve "Embarques" en nav |
| A09 | Password incorrecto | User: "cajera1", Pass: "wrong" | Error "Credenciales invalidas" |
| A10 | Usuario inexistente | User: "noexiste", Pass: "demo123" | Error "Credenciales invalidas" |

### 1.3 Sesion

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| A11 | Logout proveedor | Click "Salir" | Redirige a `/login`, cookie eliminada |
| A12 | Logout despacho | Click "Salir" | Redirige a `/login/dispatch` |
| A13 | Sesion expirada | Esperar 8+ horas (o manipular cookie) | Redirige a login al intentar navegar |
| A14 | Acceso sin sesion | Navegar directo a `/portal/invoices` | Redirige a `/login` |

---

## 2. PORTAL PROVEEDORES — FACTURAS

### 2.1 Listado (`/portal/invoices`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| F01 | Carga inicial | Login demo, ir a Facturas | Muestra 7 facturas, conteo correcto |
| F02 | Buscar por numero | Escribir "194801" en buscador | Filtra a 1 resultado (FAC 194801) |
| F03 | Buscar por referencia | Escribir "OC-2026-0401" | Filtra a factura con esa ref |
| F04 | Filtrar por pagada | Seleccionar "Pagada" en filtro estado | Muestra solo 2 facturas pagadas |
| F05 | Filtrar por no pagada | Seleccionar "No Pagada" | Muestra facturas con saldo pendiente |
| F06 | Filtrar por fecha | Desde: 2026-04-10, Hasta: 2026-04-15 | Muestra facturas en ese rango |
| F07 | Limpiar filtros | Aplicar filtros, click "Limpiar filtros" | Vuelve a mostrar todas |
| F08 | Sin resultados | Buscar texto inexistente | Muestra "No se encontraron facturas" |
| F09 | Exportar XLSX | Click "Exportar XLSX" | Descarga archivo .xlsx con datos filtrados |
| F10 | XLSX con filtros | Filtrar por pagada, luego exportar | Archivo contiene solo facturas pagadas |

### 2.2 Detalle (`/portal/invoices/[id]`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| F11 | Ver detalle | Click en FAC 194801 | Muestra header, 5 cards resumen, lineas de producto |
| F12 | Card peso total | Abrir factura 1001 | Card "Peso Total" muestra 7.000 kg (5000+2000+0) |
| F13 | Columna peso tabla | Ver tabla desktop | Columna "Peso (kg)" visible con valores por linea |
| F14 | Peso en mobile | Ver en mobile | Cards muestran campo "Peso" por producto |
| F15 | Descargar PDF | Click "Descargar PDF" | Descarga archivo PDF (placeholder en demo) |
| F16 | Factura inexistente | Navegar a `/portal/invoices/9999` | Muestra "Factura no encontrada" |

---

## 3. GUIAS DE DESPACHO

### 3.1 Seleccion de tipo (`/portal/dispatch`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| G01 | Ver tipos disponibles | Navegar a Despacho | 3 cards: Traslado, Venta Nacional, Exportacion |
| G02 | Seleccionar traslado | Click "Traslado" | Navega a `/portal/dispatch/new?type=transfer` |
| G03 | Seleccionar nacional | Click "Venta Nacional" | Navega a `/portal/dispatch/new?type=national` |
| G04 | Seleccionar exportacion | Click "Exportacion" | Navega a `/portal/dispatch/new?type=export` |

### 3.2 Guia de Traslado

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| G05 | Formulario completo | Seleccionar tipo transfer | Muestra: info general, transporte, bodegas, centro costo, productos |
| G06 | Crear guia valida | Llenar todos los campos, submit | Redirige a success con numero GD-XXXXX |
| G07 | Sin destinatario | Submit sin seleccionar partner | Error "Debe seleccionar un destinatario" |
| G08 | Sin peso | Submit con peso vacio | Error "Debe ingresar el peso" |
| G09 | Sin patente | Submit sin patente | Error "Debe ingresar la patente" |
| G10 | Sin chofer | Submit sin chofer | Error "Debe ingresar el nombre del chofer" |
| G11 | Sin tipo material | Submit sin tipo material | Error "Debe seleccionar el tipo de material" |
| G12 | Sin productos | Submit sin agregar lineas | Error "Debe agregar al menos un producto" |
| G13 | Selector bodega origen | Verificar dropdown bodegas | Muestra 3 bodegas (Quilicura, Valparaiso, Patio) |
| G14 | Selector centro costo | Verificar dropdown | Muestra 4 centros de costo |

### 3.3 Guia Venta Nacional

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| G15 | Precio fijo auto | Seleccionar "Minera Los Pelambres" | Muestra badge "Precio fijo: $50/kg" sin toggle manual |
| G16 | Sin precio fijo | Seleccionar "CAP Acero S.A." | No muestra badge, precio editable |
| G17 | Crear guia nacional | Llenar todos los campos con precio | Crea guia exitosamente |

### 3.4 Guia Exportacion (flujo cajera)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| G18 | Selector embarque | Ir a export | Muestra embarques activos con capacidad |
| G19 | Campos contenedor | Seleccionar embarque | Aparecen campos: N contenedor, sello, peso neto, tara |
| G20 | Crear guia export | Llenar embarque + contenedor + transporte | Crea guia, incrementa containersUsed en embarque |
| G21 | Embarque lleno | Intentar crear guia en embarque con limite alcanzado | Error "Embarque ha alcanzado su limite de contenedores" |
| G22 | Embarque cerrado | Verificar que embarques cerrados no aparecen | Solo embarques activos con capacidad disponible |

---

## 4. EMBARQUES DE EXPORTACION (Admin COMEX)

### 4.1 Listado (`/portal/dispatch/export-shipments`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| E01 | Ver lista | Login admin.comex, navegar a Embarques | Tabla con 3 embarques demo |
| E02 | Badges estado | Verificar columna estado | Active=verde, Closed=gris, Draft=amarillo |
| E03 | Contenedores usados | Verificar columna | Muestra "1/3", "0/5", "2/2" |

### 4.2 Crear embarque (`/portal/dispatch/export-shipments/new`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| E04 | Formulario completo | Navegar a crear | Campos: DUS, Despacho, Booking, OV, Agencia, Limite |
| E05 | Crear valido | Llenar todos los campos | Crea embarque, redirige a lista |
| E06 | Sin DUS | Submit sin DUS | Error validacion |
| E07 | Sin booking | Submit sin booking | Error validacion |
| E08 | Limite invalido | Ingresar 0 o negativo | Error validacion |

### 4.3 Detalle embarque (`/portal/dispatch/export-shipments/[id]`)

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| E09 | Ver detalle activo | Click en EMB-00001 | Info embarque + 1 contenedor en tabla |
| E10 | Ver detalle cerrado | Click en EMB-00003 | Info + 2 contenedores, estado "Cerrado" |
| E11 | Tabla contenedores | Verificar tabla | Columnas: Guia, Contenedor, Sello, Peso Neto, Tara, Fecha |
| E12 | Embarque inexistente | Navegar a `/portal/dispatch/export-shipments/999` | Error "Embarque no encontrado" |

---

## 5. NAVEGACION Y ROLES

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| N01 | Nav proveedor | Login demo (proveedor) | Ve: Inicio, Mis Facturas, Guias de Despacho |
| N02 | Nav cajera | Login cajera1 | Ve: Inicio, Guias de Despacho. NO ve Facturas ni Embarques |
| N03 | Nav admin comex | Login admin.comex | Ve: Inicio, Guias de Despacho, Embarques |
| N04 | Link activo | Navegar a Facturas | Link "Mis Facturas" resaltado en nav |
| N05 | Breadcrumb facturas | Estar en detalle factura | Link "Volver a Mis Facturas" funciona |
| N06 | Breadcrumb despacho | Estar en formulario guia | Link "Volver a tipos de guia" funciona |
| N07 | Mobile menu | En mobile, click hamburger | Menu desplegable con mismos links filtrados |
| N08 | Logo home | Click logo/nombre en nav | Navega a `/portal` |
| N09 | Seccion admin dispatch | Login admin.comex, ir a Dispatch | Ve seccion "Administracion" con link Embarques |
| N10 | Cajera sin admin | Login cajera1, ir a Dispatch | NO ve seccion "Administracion" |

---

## 6. MULTI-EMPRESA

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| M01 | Switcher visible despacho | Login admin.comex | Dropdown empresa visible en nav |
| M02 | Switcher oculto proveedor | Login demo proveedor | NO ve dropdown empresa |
| M03 | Cambiar empresa | Click dropdown, seleccionar otra | Pagina recarga, nombre empresa cambia |
| M04 | Empresa actual marcada | Abrir dropdown | Empresa actual tiene checkmark o highlight |
| M05 | Persistencia | Cambiar empresa, navegar entre paginas | Empresa se mantiene durante sesion |

---

## 7. RESPONSIVIDAD

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| R01 | Facturas mobile | Abrir `/portal/invoices` en 375px | Cards en vez de tabla, scroll vertical |
| R02 | Facturas desktop | Abrir en 1280px | Tabla completa con todas las columnas |
| R03 | Detalle factura mobile | Abrir detalle en 375px | Cards con Cant/Peso/P.Unit/Subtotal en grid |
| R04 | Formulario despacho mobile | Abrir formulario en 375px | Campos en 1 columna, botones full-width |
| R05 | Nav mobile | 375px | Hamburger menu, no links visibles en header |
| R06 | Embarques mobile | Lista embarques en 375px | Cards o tabla con scroll horizontal |

---

## 8. SEGURIDAD

| # | Caso | Pasos | Resultado Esperado |
|---|------|-------|--------------------|
| S01 | Cookie firmada | Inspeccionar cookie en DevTools | Formato: base64payload.hexsignature |
| S02 | Cookie manipulada | Alterar payload en cookie | getSession() retorna null, redirige a login |
| S03 | Rate limit login | 11 requests rapidos a `/api/auth/login` | Request 11 retorna 429 |
| S04 | Rate limit dispatch | 11 requests a `/api/auth/login/dispatch` | Request 11 retorna 429 |
| S05 | API sin sesion | curl GET `/api/invoices` sin cookie | 401 "No autorizado" |
| S06 | API invoice ajena | Acceder a invoice con ID no del partner | 404 (en produccion) |
| S07 | httpOnly cookie | Intentar `document.cookie` en consola | Cookie de sesion NO visible |
| S08 | XSS en inputs | Ingresar `<script>alert(1)</script>` en campos | Se muestra como texto, no se ejecuta |

---

## Datos de Prueba Demo

### Credenciales

| Tipo | Credencial | Resultado |
|------|-----------|-----------|
| Proveedor | RUT: 76.123.456-7 | Login exitoso |
| Proveedor | Boton "Demo" | Login automatico |
| Cajera | cajera1 / demo123 | Rol cajera |
| Admin COMEX | admin.comex / demo123 | Rol admin_comex |

### IDs Importantes

| Recurso | IDs Demo |
|---------|----------|
| Facturas | 1001-1007 |
| Partners | 1-8 (con fixedPrice: 1=50, 2=45) |
| Productos | 101-110 |
| Ordenes Venta | 1-5 |
| Embarques | 1-3 |
| Contenedores | 1-3 |
| Bodegas | 1-3 |
| Centros Costo | 1-4 |

### URLs de Prueba

```
http://localhost:3000/login                          # Login proveedor
http://localhost:3000/login/dispatch                 # Login despacho
http://localhost:3000/portal                         # Home
http://localhost:3000/portal/invoices                # Listado facturas
http://localhost:3000/portal/invoices/1001           # Detalle factura
http://localhost:3000/portal/dispatch                # Tipos de guia
http://localhost:3000/portal/dispatch/new?type=transfer   # Nueva guia traslado
http://localhost:3000/portal/dispatch/new?type=national   # Nueva guia nacional
http://localhost:3000/portal/dispatch/new?type=export     # Nueva guia export
http://localhost:3000/portal/dispatch/export-shipments    # Lista embarques
http://localhost:3000/portal/dispatch/export-shipments/1  # Detalle embarque
http://localhost:3000/portal/dispatch/export-shipments/new # Crear embarque
```

---

## Criterios de Aceptacion

- Todos los casos de prioridad **Alta** deben pasar sin errores
- No debe haber errores en consola del navegador (excepto warnings de React dev)
- Tiempos de carga < 2 segundos en todas las paginas
- Formularios muestran feedback inmediato de validacion
- Todos los estados de error tienen mensajes en espanol
- La aplicacion funciona en Chrome, Firefox y Safari (ultimas 2 versiones)
