#!/bin/bash
# =============================================================
# Production Test Suite — Portal Romerelli
# Target: https://romerelli.giraffos.com
# =============================================================

BASE="https://romerelli.giraffos.com"
PASS=0
FAIL=0
SKIP=0
RESULTS=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

log_pass() {
  PASS=$((PASS + 1))
  RESULTS+="  ${GREEN}PASS${NC} $1\n"
  echo -e "  ${GREEN}PASS${NC} $1"
}

log_fail() {
  FAIL=$((FAIL + 1))
  RESULTS+="  ${RED}FAIL${NC} $1 — $2\n"
  echo -e "  ${RED}FAIL${NC} $1 — $2"
}

log_skip() {
  SKIP=$((SKIP + 1))
  RESULTS+="  ${YELLOW}SKIP${NC} $1\n"
  echo -e "  ${YELLOW}SKIP${NC} $1"
}

section() {
  echo ""
  echo -e "${CYAN}${BOLD}═══ $1 ═══${NC}"
  RESULTS+="\n${BOLD}$1${NC}\n"
}

# Helper: HTTP request returning status code
http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

# Helper: HTTP request returning body
http_body() {
  curl -s "$@"
}

# Helper: Extract cookie from response
get_cookie() {
  curl -s -c - "$@" | grep portal_session | awk '{print $NF}'
}

echo -e "${BOLD}Portal Romerelli — Production Test Suite${NC}"
echo -e "Target: ${CYAN}$BASE${NC}"
echo -e "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# =============================================================
section "1. HEALTH & AVAILABILITY"
# =============================================================

# Health endpoint
STATUS=$(http_status "$BASE/api/health")
if [ "$STATUS" = "200" ]; then
  log_pass "A00: Health endpoint returns 200"
else
  log_fail "A00: Health endpoint" "Got $STATUS"
fi

# Login page loads
STATUS=$(http_status "$BASE/login")
if [ "$STATUS" = "200" ]; then
  log_pass "A00b: Login page loads"
else
  log_fail "A00b: Login page loads" "Got $STATUS"
fi

# Dispatch login page loads
STATUS=$(http_status "$BASE/login/dispatch")
if [ "$STATUS" = "200" ]; then
  log_pass "A00c: Dispatch login page loads"
else
  log_fail "A00c: Dispatch login page loads" "Got $STATUS"
fi

# =============================================================
section "2. AUTHENTICATION — Vendor"
# =============================================================

# A01: Demo login
RESP=$(curl -s -c /tmp/romerelli_demo_cookies -X POST "$BASE/api/auth/demo" \
  -H "Content-Type: application/json")
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "A01: Demo login returns ok:true"
else
  log_fail "A01: Demo login" "Response: $RESP"
fi

DEMO_COOKIE=$(cat /tmp/romerelli_demo_cookies | grep portal_session | awk '{print $NF}')

# A02: Login with valid RUT
RESP=$(http_body -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"vat":"76.123.456-7"}')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "A02: Login with valid RUT"
else
  log_fail "A02: Login with valid RUT" "Response: $RESP"
fi

# A04: Login with invalid RUT
RESP=$(http_body -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"vat":"11.111.111-1"}')
STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if [ -n "$STATUS" ]; then
  log_pass "A04: Invalid RUT returns error"
else
  log_fail "A04: Invalid RUT" "Expected error, got: $RESP"
fi

# A05: Login empty VAT
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"vat":""}')
if [ "$HTTP" = "400" ]; then
  log_pass "A05: Empty VAT returns 400"
else
  log_fail "A05: Empty VAT" "Got $HTTP"
fi

# =============================================================
section "3. AUTHENTICATION — Dispatch"
# =============================================================

# A07: Login cajera
RESP=$(curl -s -c /tmp/romerelli_cajera_cookies -X POST "$BASE/api/auth/login/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"username":"cajera1","password":"demo123"}')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "A07: Cajera login successful"
else
  log_fail "A07: Cajera login" "Response: $RESP"
fi

CAJERA_COOKIE=$(cat /tmp/romerelli_cajera_cookies | grep portal_session | awk '{print $NF}')

# A08: Login admin comex
RESP=$(curl -s -c /tmp/romerelli_admin_cookies -X POST "$BASE/api/auth/login/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.comex","password":"demo123"}')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
ROLE=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('role',''))" 2>/dev/null)
if [ "$OK" = "True" ] && [ "$ROLE" = "admin_comex" ]; then
  log_pass "A08: Admin COMEX login with correct role"
else
  log_fail "A08: Admin COMEX login" "Response: $RESP"
fi

ADMIN_COOKIE=$(cat /tmp/romerelli_admin_cookies | grep portal_session | awk '{print $NF}')

# A09: Wrong password
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"username":"cajera1","password":"wrongpass"}')
if [ "$HTTP" = "401" ]; then
  log_pass "A09: Wrong password returns 401"
else
  log_fail "A09: Wrong password" "Got $HTTP"
fi

# A10: Unknown user
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"username":"noexiste","password":"demo123"}')
if [ "$HTTP" = "401" ]; then
  log_pass "A10: Unknown user returns 401"
else
  log_fail "A10: Unknown user" "Got $HTTP"
fi

# =============================================================
section "4. API — Unauthenticated Access"
# =============================================================

# S05: API without session
HTTP=$(http_status "$BASE/api/invoices")
if [ "$HTTP" = "401" ]; then
  log_pass "S05: /api/invoices without session returns 401"
else
  log_fail "S05: API without session" "Got $HTTP"
fi

HTTP=$(http_status "$BASE/api/dispatch")
if [ "$HTTP" = "401" ]; then
  log_pass "S05b: /api/dispatch without session returns 401"
else
  log_fail "S05b: /api/dispatch without session" "Got $HTTP"
fi

HTTP=$(http_status "$BASE/api/export-shipments")
if [ "$HTTP" = "401" ]; then
  log_pass "S05c: /api/export-shipments without session returns 401"
else
  log_fail "S05c: /api/export-shipments without session" "Got $HTTP"
fi

# =============================================================
section "5. INVOICES API (Demo Session)"
# =============================================================

# F01: List invoices
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?page=1&limit=20")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" = "7" ]; then
  log_pass "F01: Invoice list returns 7 invoices"
else
  log_fail "F01: Invoice list" "Expected 7, got total=$TOTAL"
fi

# F02: Search by number
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?q=194801")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" = "1" ]; then
  log_pass "F02: Search by invoice number finds 1 result"
else
  log_fail "F02: Search by number" "Expected 1, got $TOTAL"
fi

# F03: Search by reference
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?q=OC-2026-0401")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" = "1" ]; then
  log_pass "F03: Search by reference finds 1 result"
else
  log_fail "F03: Search by reference" "Expected 1, got $TOTAL"
fi

# F04: Filter paid
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?paymentState=paid")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" = "2" ]; then
  log_pass "F04: Filter paid returns 2 invoices"
else
  log_fail "F04: Filter paid" "Expected 2, got $TOTAL"
fi

# F05: Filter not_paid
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?paymentState=not_paid")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" -ge "3" ] 2>/dev/null; then
  log_pass "F05: Filter not_paid returns $TOTAL invoices"
else
  log_fail "F05: Filter not_paid" "Expected >=3, got $TOTAL"
fi

# F06: Filter by date range
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?dateFrom=2026-04-10&dateTo=2026-04-15")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" -ge "1" ] 2>/dev/null; then
  log_pass "F06: Date range filter returns $TOTAL invoices"
else
  log_fail "F06: Date range filter" "Expected >=1, got $TOTAL"
fi

# F08: No results
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices?q=XXXXXXXXX")
TOTAL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
if [ "$TOTAL" = "0" ]; then
  log_pass "F08: Nonsense search returns 0 results"
else
  log_fail "F08: Nonsense search" "Expected 0, got $TOTAL"
fi

# F11: Invoice detail
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices/1001")
LINES=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('lines',[])))" 2>/dev/null)
if [ "$LINES" = "3" ]; then
  log_pass "F11: Invoice 1001 detail has 3 lines"
else
  log_fail "F11: Invoice detail" "Expected 3 lines, got $LINES"
fi

# F12: Weight in lines
HAS_WEIGHT=$(echo "$RESP" | python3 -c "
import sys,json
lines = json.load(sys.stdin).get('lines',[])
print('yes' if any(l.get('weight',0) > 0 for l in lines) else 'no')
" 2>/dev/null)
if [ "$HAS_WEIGHT" = "yes" ]; then
  log_pass "F12: Invoice lines include weight data"
else
  log_fail "F12: Weight in lines" "No weight found"
fi

# F15: PDF download
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices/1001/pdf")
if [ "$HTTP" = "200" ]; then
  log_pass "F15: PDF download returns 200"
else
  log_fail "F15: PDF download" "Got $HTTP"
fi

# PDF content type
CT=$(curl -s -I -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices/1001/pdf" | grep -i "content-type" | tr -d '\r')
if echo "$CT" | grep -qi "application/pdf"; then
  log_pass "F15b: PDF has correct content-type"
else
  log_fail "F15b: PDF content-type" "Got: $CT"
fi

# F16: Nonexistent invoice
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices/9999")
if [ "$HTTP" = "404" ]; then
  log_pass "F16: Nonexistent invoice returns 404"
else
  log_fail "F16: Nonexistent invoice" "Got $HTTP"
fi

# F09: XLSX export
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" "$BASE/api/invoices/export")
if [ "$HTTP" = "200" ]; then
  log_pass "F09: XLSX export returns 200"
else
  log_fail "F09: XLSX export" "Got $HTTP"
fi

# =============================================================
section "6. SUPPORTING DATA APIs"
# =============================================================

# Partners
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/partners")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge "8" ] 2>/dev/null; then
  log_pass "Partners API returns $COUNT partners"
else
  log_fail "Partners API" "Expected >=8, got $COUNT"
fi

# Partners search
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/partners?q=Codelco")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" = "1" ]; then
  log_pass "Partners search 'Codelco' returns 1"
else
  log_fail "Partners search" "Expected 1, got $COUNT"
fi

# Products
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/products")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge "10" ] 2>/dev/null; then
  log_pass "Products API returns $COUNT products"
else
  log_fail "Products API" "Expected >=10, got $COUNT"
fi

# Sale orders
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/sale-orders")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge "5" ] 2>/dev/null; then
  log_pass "Sale orders API returns $COUNT orders"
else
  log_fail "Sale orders API" "Expected >=5, got $COUNT"
fi

# Material types
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/material-types")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge "11" ] 2>/dev/null; then
  log_pass "Material types API returns $COUNT types"
else
  log_fail "Material types API" "Expected >=11, got $COUNT"
fi

# Warehouses
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/warehouses")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge "3" ] 2>/dev/null; then
  log_pass "Warehouses API returns $COUNT warehouses"
else
  log_fail "Warehouses API" "Expected >=3, got $COUNT"
fi

# Cost centers
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" "$BASE/api/cost-centers")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$COUNT" -ge "4" ] 2>/dev/null; then
  log_pass "Cost centers API returns $COUNT centers"
else
  log_fail "Cost centers API" "Expected >=4, got $COUNT"
fi

# =============================================================
section "7. DISPATCH GUIDE CREATION"
# =============================================================

# G06: Create transfer guide
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" -X POST "$BASE/api/dispatch" \
  -H "Content-Type: application/json" \
  -d '{
    "guideType":"transfer",
    "partnerId":1,
    "dateDispatch":"2026-04-20",
    "peso":5000,
    "patente":"AB-CD-12",
    "chofer":"Juan Perez",
    "tipoMaterial":"chatarra_cobre",
    "referencia":"TKT-TEST-001",
    "lines":[{"productId":101,"quantity":5000,"priceUnit":0,"description":"Chatarra de Cobre Cat. A","uomId":1}]
  }')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
GUIDE_NAME=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('guide',{}).get('name',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "G06: Create transfer guide — $GUIDE_NAME"
else
  log_fail "G06: Create transfer guide" "Response: $RESP"
fi

# G07: Missing partner
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" -X POST "$BASE/api/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"guideType":"transfer","dateDispatch":"2026-04-20","peso":100,"patente":"XX","chofer":"Test","tipoMaterial":"chatarra_cobre","lines":[{"productId":101,"quantity":1}]}')
if [ "$HTTP" = "400" ]; then
  log_pass "G07: Missing partnerId returns 400"
else
  log_fail "G07: Missing partnerId" "Got $HTTP"
fi

# G08: Missing transport fields
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" -X POST "$BASE/api/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"guideType":"transfer","partnerId":1,"dateDispatch":"2026-04-20","lines":[{"productId":101,"quantity":1}]}')
if [ "$HTTP" = "400" ]; then
  log_pass "G08-11: Missing transport fields returns 400"
else
  log_fail "G08-11: Missing transport fields" "Got $HTTP"
fi

# G12: No product lines
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" -X POST "$BASE/api/dispatch" \
  -H "Content-Type: application/json" \
  -d '{"guideType":"transfer","partnerId":1,"dateDispatch":"2026-04-20","peso":100,"patente":"XX","chofer":"Test","tipoMaterial":"chatarra_cobre","lines":[]}')
if [ "$HTTP" = "400" ]; then
  log_pass "G12: Empty lines returns 400"
else
  log_fail "G12: Empty lines" "Got $HTTP"
fi

# G17: Create national guide
RESP=$(http_body -b "portal_session=$DEMO_COOKIE" -X POST "$BASE/api/dispatch" \
  -H "Content-Type: application/json" \
  -d '{
    "guideType":"national",
    "partnerId":3,
    "dateDispatch":"2026-04-20",
    "peso":10000,
    "patente":"CC-DD-34",
    "chofer":"Pedro Lopez",
    "tipoMaterial":"chatarra_hierro",
    "referencia":"TKT-TEST-002",
    "lines":[{"productId":104,"quantity":10000,"priceUnit":20,"description":"Chatarra de Hierro","uomId":1}]
  }')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "G17: Create national guide"
else
  log_fail "G17: Create national guide" "Response: $RESP"
fi

# =============================================================
section "8. EXPORT SHIPMENTS"
# =============================================================

# E01: List shipments
RESP=$(http_body -b "portal_session=$ADMIN_COOKIE" "$BASE/api/export-shipments")
COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('shipments',[])))" 2>/dev/null)
if [ "$COUNT" -ge "3" ] 2>/dev/null; then
  log_pass "E01: Shipment list returns $COUNT shipments"
else
  log_fail "E01: Shipment list" "Expected >=3, got $COUNT"
fi

# E05: Create shipment
RESP=$(http_body -b "portal_session=$ADMIN_COOKIE" -X POST "$BASE/api/export-shipments" \
  -H "Content-Type: application/json" \
  -d '{
    "dus":"DUS-TEST-001",
    "despacho":"DESP-TEST-001",
    "booking":"BK-TEST-001",
    "saleOrderId":2,
    "customsAgencyId":6,
    "containerLimit":4
  }')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "E05: Create shipment successful"
else
  log_fail "E05: Create shipment" "Response: $RESP"
fi

# E06: Create shipment missing fields
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$ADMIN_COOKIE" -X POST "$BASE/api/export-shipments" \
  -H "Content-Type: application/json" \
  -d '{"dus":"TEST"}')
if [ "$HTTP" = "400" ]; then
  log_pass "E06: Missing shipment fields returns 400"
else
  log_fail "E06: Missing shipment fields" "Got $HTTP"
fi

# E09: Shipment detail
RESP=$(http_body -b "portal_session=$ADMIN_COOKIE" "$BASE/api/export-shipments/1")
DUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('shipment',{}).get('dus',''))" 2>/dev/null)
CONTAINERS=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('containers',[])))" 2>/dev/null)
if [ -n "$DUS" ]; then
  log_pass "E09: Shipment detail — DUS=$DUS, $CONTAINERS containers"
else
  log_fail "E09: Shipment detail" "Response: $RESP"
fi

# E12: Nonexistent shipment
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$ADMIN_COOKIE" "$BASE/api/export-shipments/999")
if [ "$HTTP" = "404" ]; then
  log_pass "E12: Nonexistent shipment returns 404"
else
  log_fail "E12: Nonexistent shipment" "Got $HTTP"
fi

# =============================================================
section "9. COMPANY SWITCH"
# =============================================================

# M03: Switch company
RESP=$(http_body -b "portal_session=$ADMIN_COOKIE" -X POST "$BASE/api/auth/switch-company" \
  -H "Content-Type: application/json" \
  -d '{"companyId":2}')
OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',''))" 2>/dev/null)
if [ "$OK" = "True" ]; then
  log_pass "M03: Switch company to ID 2 successful"
else
  log_fail "M03: Switch company" "Response: $RESP"
fi

# Invalid company
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$ADMIN_COOKIE" -X POST "$BASE/api/auth/switch-company" \
  -H "Content-Type: application/json" \
  -d '{"companyId":999}')
if [ "$HTTP" = "400" ] || [ "$HTTP" = "404" ]; then
  log_pass "M03b: Invalid company ID rejected ($HTTP)"
else
  log_fail "M03b: Invalid company" "Got $HTTP"
fi

# =============================================================
section "10. PORTAL PAGES (SSR)"
# =============================================================

# Pages that require session — should return 200 with demo cookie
for PAGE in "/portal" "/portal/invoices" "/portal/dispatch"; do
  STATUS=$(http_status -b "portal_session=$DEMO_COOKIE" "$BASE$PAGE")
  if [ "$STATUS" = "200" ]; then
    log_pass "Page $PAGE returns 200"
  else
    log_fail "Page $PAGE" "Got $STATUS"
  fi
done

# Dispatch-specific pages with admin session
for PAGE in "/portal/dispatch/export-shipments" "/portal/dispatch/export-shipments/new"; do
  STATUS=$(http_status -b "portal_session=$ADMIN_COOKIE" "$BASE$PAGE")
  if [ "$STATUS" = "200" ]; then
    log_pass "Page $PAGE returns 200"
  else
    log_fail "Page $PAGE" "Got $STATUS"
  fi
done

# Dispatch form pages
for TYPE in "transfer" "national" "export"; do
  STATUS=$(http_status -b "portal_session=$DEMO_COOKIE" "$BASE/portal/dispatch/new?type=$TYPE")
  if [ "$STATUS" = "200" ]; then
    log_pass "Dispatch form type=$TYPE returns 200"
  else
    log_fail "Dispatch form type=$TYPE" "Got $STATUS"
  fi
done

# =============================================================
section "11. LOGOUT"
# =============================================================

# A11: Logout
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -b "portal_session=$DEMO_COOKIE" -X POST "$BASE/api/auth/logout")
if [ "$HTTP" = "200" ] || [ "$HTTP" = "302" ] || [ "$HTTP" = "307" ]; then
  log_pass "A11: Logout returns $HTTP"
else
  log_fail "A11: Logout" "Got $HTTP"
fi

# =============================================================
# SUMMARY
# =============================================================
echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${BOLD}  TEST RESULTS SUMMARY${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "  ${GREEN}PASSED: $PASS${NC}"
echo -e "  ${RED}FAILED: $FAIL${NC}"
echo -e "  ${YELLOW}SKIPPED: $SKIP${NC}"
TOTAL=$((PASS + FAIL + SKIP))
echo -e "  TOTAL:  $TOTAL"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}ALL TESTS PASSED${NC}"
else
  echo -e "  ${RED}${BOLD}$FAIL TEST(S) FAILED${NC}"
fi
echo ""

# Cleanup
rm -f /tmp/romerelli_demo_cookies /tmp/romerelli_cajera_cookies /tmp/romerelli_admin_cookies
