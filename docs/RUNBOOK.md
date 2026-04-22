# Runbook — Portal Romerelli

Guia operacional para TI Romerelli. Documenta tareas de mantenimiento y respuesta ante incidentes del portal `romerelli.giraffos.com`.

## 1. Arquitectura resumida

- **Portal web:** Next.js 16 desplegado en **Coolify** (servidor self-hosted).
- **ERP:** Odoo 18 en **odoo.sh** (SaaS gestionado).
- **Modulo custom:** `romerelli_portal` versionado en GitHub.
- Portal y Odoo se comunican via JSON-RPC autenticado con API key.

## 2. Acceso a los sistemas

| Sistema | URL | Quien tiene acceso |
|---|---|---|
| Portal | https://romerelli.giraffos.com | Usuarios finales |
| Coolify | https://coolify.giraffos.com | TI Romerelli, Giraffos |
| Odoo.sh | https://www.odoo.sh | TI Romerelli (lectura), Giraffos (admin) |
| GitHub | https://github.com/giraffos/romerelli-portal | Giraffos |
| Sentry | https://sentry.io/organizations/giraffos | TI Romerelli, Giraffos |

Las credenciales estan en el gestor de contrasenas corporativo. Nunca compartir por email o chat.

## 3. Reiniciar el portal en Coolify

1. Ingresar a Coolify (`https://coolify.giraffos.com`).
2. En el menu, abrir **Applications**.
3. Seleccionar la aplicacion **romerelli-portal**.
4. Presionar el boton **Restart**.
5. Esperar 30-60 segundos. El estado debe cambiar a **Running**.
6. Validar abriendo `https://romerelli.giraffos.com/login` en el navegador.

> **Si el reinicio falla:** revisar los logs (seccion 5) y, si no hay pista clara, escalar a Giraffos.

## 4. Verificar estado de Odoo.sh

1. Ingresar a `https://www.odoo.sh` con la cuenta de TI Romerelli.
2. Seleccionar el proyecto **Romerelli**.
3. Revisar:
   - **Production branch:** debe estar en verde.
   - **Modulos instalados:** `romerelli_portal` debe aparecer activo.
   - **Logs:** solapa **Logs** en la branch de produccion.
4. Si hay un deploy en curso, esperar a que termine antes de reportar incidencias.

## 5. Leer logs

### Logs del portal (Coolify)

1. En Coolify, abrir la aplicacion **romerelli-portal**.
2. Entrar a la solapa **Logs**.
3. Filtrar por nivel (`error`, `warn`) usando el buscador.
4. Los logs son JSON estructurados. Campos relevantes: `level`, `msg`, `uid`, `partnerId`, `route`.

### Logs de Odoo

1. En odoo.sh, abrir el proyecto y luego la branch **production**.
2. Solapa **Logs** -> filtrar por **ERROR** o **WARNING**.
3. Si el problema involucra una guia especifica, buscar por el numero (ej. `WH/OUT/00123`).

### Errores en Sentry

1. Ingresar a Sentry y seleccionar el proyecto **romerelli-portal**.
2. Issues abiertos aparecen en **Unresolved**.
3. Cada issue muestra stacktrace, usuario afectado y frecuencia.

## 6. Rotacion de API keys

Se recomienda rotar cada 90 dias o al desvincular personal con acceso.

1. En Odoo, ir a **Settings > Users & Companies > Users**.
2. Seleccionar el usuario `api.portal` (`ODOO_API_USER`).
3. Solapa **Account Security** -> **New API Key**. Copiar la nueva clave.
4. En Coolify, abrir la app **romerelli-portal** -> **Environment Variables**.
5. Actualizar `ODOO_API_KEY` con el nuevo valor.
6. Presionar **Save** y luego **Restart** (ver seccion 3).
7. Validar login y creacion de guia de prueba.
8. En Odoo, eliminar la API key antigua.

## 7. Respuesta ante fallo en creacion de guias

Sintoma: cajera reporta error al presionar **Guardar y validar**.

1. Confirmar el alcance: una usuaria, varias o todas.
2. Revisar **Sentry** (seccion 5) por errores recientes con prefijo `dispatch.create`.
3. Revisar **logs del portal** en Coolify buscando `level=error`.
4. Revisar **Odoo.sh logs** por errores de validacion en `stock.picking`.

### Arbol de decision

| Sintoma | Accion |
|---|---|
| Sentry muestra `ECONNREFUSED` a Odoo | Verificar estado de odoo.sh (seccion 4). |
| Error `Access denied` en Odoo logs | Revisar si la API key fue revocada. Rotar (seccion 6). |
| Error `Invalid session` en el portal | Puede ser `SESSION_SECRET` cambiado. No rotar sin coordinar. |
| Error `Embarque lleno` | Caso funcional, no tecnico. Derivar a admin.comex. |
| Sin errores visibles, pero boton no responde | Reiniciar el portal (seccion 3). Limpiar cache del navegador de la cajera. |

## 8. Contactos de escalamiento

| Nivel | Contacto |
|---|---|
| Nivel 1 | TI Romerelli interno |
| Nivel 2 | Giraffos — soporte@giraffos.com |
| Emergencia 24/7 | Canal de Slack compartido con Giraffos |

## 9. Checklist semanal

- [ ] Revisar issues abiertos en Sentry y cerrarlos o escalarlos.
- [ ] Revisar uso de CPU/RAM del portal en Coolify.
- [ ] Confirmar que odoo.sh no tiene deploys pendientes.
- [ ] Verificar respaldo de base de datos Odoo (odoo.sh automatico).
- [ ] Validar que al menos una cajera ha creado guias en las ultimas 24 horas (indicador de salud).
