# Romerelli Portal — Technical Overview

Operational web portal for Romerelli SpA (Chilean metal recycling). Provides cashiers (`cajera`) and export administrators (`admin.comex`) with a focused UI to create dispatch guides and manage export shipments without exposing the full Odoo backend.

## Architecture

```
+------------------+       JSON-RPC        +---------------------+
|  Next.js 16      | <-------------------> |  Odoo 18 (SaaS)     |
|  App Router      |   /jsonrpc + models   |  odoo.sh instance   |
|                  |                       |  custom module:     |
|  - Server Actions|                       |  romerelli_portal   |
|  - Route Handlers|                       |                     |
+------------------+                       +---------------------+
        |
        | HMAC-signed session cookie
        v
   End user (cajera / admin.comex)
```

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React Server Components, TailwindCSS |
| Auth | Custom email/password against Odoo `res.users`, session stored in HMAC-signed cookie |
| Backend API | Next.js Route Handlers + Server Actions |
| ERP integration | Odoo 18 JSON-RPC (`/jsonrpc` and `/web/session/authenticate`) |
| Odoo module | `romerelli_portal` (Python, XML, QWeb) |
| Deploy | Coolify (self-hosted) |
| Observability | Sentry (errors), structured JSON logs |

### Custom Odoo module `romerelli_portal`

Provides the domain extensions the portal depends on:

- `x_romerelli.export.shipment` — export shipments with container limit.
- `x_romerelli.export.container` — containers linked to a shipment and a picking.
- Transport fields on `stock.picking`: `x_patente`, `x_chofer`, `x_peso`, `x_tipo_material`, `x_referencia`.
- Fixed-price partner configuration on `res.partner`.
- QWeb reports for dispatch guides and export shipments (branded, `web.external_layout`).

Module path in monorepo: `/romerelli-v15/romerelli_portal/`.

## Session & auth

- User submits email + password to `/api/auth/login`.
- Next.js calls Odoo `/web/session/authenticate`. On success, portal reads `uid`, `partner_id`, role from Odoo.
- Session payload (`uid`, `partnerId`, `role`, `exp`) is serialized and signed with `SESSION_SECRET` using HMAC-SHA256, then written to an `httpOnly`, `Secure`, `SameSite=Lax` cookie.
- Every Route Handler validates the cookie and rebuilds an Odoo RPC client scoped to `ODOO_API_USER` (system account) but authorized against the end user's role.

## Demo / real-partner pattern

The portal supports two modes for operator workflows:

| `partnerId` value | Meaning |
|---|---|
| `0` | **Real Odoo mode** — all RPC calls hit Odoo; records are persisted. Used in production by cajeras and admin.comex. |
| `9999` | **Demo mode** — in-memory fixtures are returned; nothing is written to Odoo. Used for training, screencasts, and frontend development without touching production data. |

The convention is that any server-side handler checks `session.partnerId === 9999` before dispatching to the demo fixture layer (`src/lib/demo/*`). This keeps demo and real code paths identical at the UI level.

Demo dispatch creation is gated by the `ALLOW_DEMO_DISPATCH` env var so production deployments can disable it entirely.

## Environment variables

| Variable | Purpose |
|---|---|
| `ODOO_URL` | Base URL of the Odoo instance (e.g. `https://romerelli.odoo.com`). |
| `ODOO_DB` | Odoo database name. |
| `ODOO_API_USER` | System account login used for privileged reads/writes. |
| `ODOO_API_KEY` | API key (not password) for `ODOO_API_USER`. Rotate periodically. |
| `SESSION_SECRET` | Random 32-byte secret for HMAC cookie signing. Rotating invalidates all sessions. |
| `SENTRY_DSN` | Sentry project DSN for error reporting. |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error`. Default `info` in production. |
| `ALLOW_DEMO_DISPATCH` | `true` / `false`. When `false`, demo-mode write operations are blocked. |

All variables must be present at runtime. The app fails fast at boot if any required variable is missing (Zod validation in `src/config/env.ts`).

## Repository layout

```
romerelli-portal/          # Next.js portal (this repo)
  src/app/                 # App Router routes (login, dispatch, shipments, api)
  src/lib/odoo/            # JSON-RPC client, model wrappers
  src/lib/session/         # HMAC cookie helpers
  src/lib/demo/            # Demo fixtures (partnerId=9999)
  docs/                    # This directory

romerelli-v15/             # Odoo module sources
  romerelli_portal/        # Custom Odoo 18 module
    models/
    views/
    reports/
    security/
    __manifest__.py
```

## Deployment

Portal runs on Coolify. Each push to `main` triggers a build and rolling deploy. See `RUNBOOK.md` for operational procedures.
