# Invoices Phase – Plan (assumed backend, feature-flagged)

This doc follows `plan.md` to prepare the invoices phase. Backend endpoints are assumed until confirmed; keep UI feature-flagged or mocked until live.

---

## 1) Scope & Acceptance Criteria
- Scope (assumed): CRUD `/api/invoices`.
- Fields (derived from KMP assumptions): `id (UUID)`, `businessId (UUID)`, `clientId (UUID)`, `invoiceNumber`, `status (draft|sent|paid|overdue)`, `issueDate`, `dueDate`, `lineItems[]` `{ id, itemId?, description, qty, price, taxId?, discount? }`, `termsId?`, `paymentInstructionId?`, `notes?`, `currency`, totals `{ subtotal, tax, discount, grandTotal }`, linked `payments?` (read-only).
- Acceptance (when backend live):
  - Live API CRUD works; totals align with backend response.
  - Validation blocks bad UUIDs/missing required fields/non-numeric qty/price/tax/discount.
  - List refetches after mutations; filters work (status/date/business/client).
  - Single toast per action; loading overlay during requests; routes guarded.
  - Payment links read-only unless backend supports editing.

## 2) KMP app (assumptions)
- Likely supports richer statuses, discounts, and offline cache; dynamic line items with tax/discount per line.
- May compute totals client-side and sync; stable IDs (in-place update).

## 3) Backend reality (to confirm)
- Endpoints `/api/invoices` CRUD; query params for filters? pagination? status enum? currency handling?
- Totals: computed server-side? expects line items summed? accepts discounts at line and header?
- Update semantics: in-place? Are line item IDs required/immutable?
- Payments linkage: can update payment links? (assumed no; treat read-only).

## 4) Contradictions table
- | Field/Behavior | KMP | Backend (assumed) | Web decision |
- | Status enums | Rich | Unknown | Use backend enum; fallback to draft/sent/paid/overdue |
- | Offline cache | Yes | N/A | Online-only |
- | Line item mutability | Likely free | Unknown | Allow add/edit/delete client-side; respect backend errors |
- | Payment link edits | Allowed in KMP? | Likely not | Read-only payments list |
- | Totals source | Client calc | Server authoritative | Compute client for UX; display server totals |

## 5) Web objectives
- Implement backend-supported fields; online-only.
- UX: list + filters (status/date range/business/client) + search; detail view with line items, totals, status badge, payments list; create/edit drawer/page with dynamic line items and selectors (tax/term/payment instruction), currency formatting; delete confirm.
- Validation: UUIDs, required business/client/invoiceNumber/status/issueDate/dueDate; numeric qty/price/tax/discount; currency required.
- Feature-flag or mocked data until backend confirmed live.

## 6) Implementation plan
- Types/Schemas: add `src/types/dto/invoices.ts` (invoice, line items, totals) + zod schemas for form/line items.
- Services/Hooks (when live): `src/services/invoices.ts` CRUD; React Query hooks `useInvoices`, `useInvoiceMutations`; keys include filters.
- UI/Page `/invoices` (replace placeholder):
  - Table: invoiceNumber, client, status badge, issue/due dates, total, business.
  - Filters: status select, date range, business/client selects, search.
  - Detail panel/drawer: line items table, taxes/terms/payment instruction, notes, totals, linked payments (read-only).
  - Create/Edit drawer/page: UUID, business/client selectors, invoiceNumber, status, issue/due dates, currency, terms/payment instruction selects, notes, dynamic line items (item select or free description, qty, price, tax, discount), totals preview.
  - Delete confirm.
- Data deps: businesses/clients hooks; master data (taxes, units, categories, terms, payment instructions); inventory items for line-item itemId select.
- State: React Query; local component state for filters/forms; computed totals client-side (subtotal, tax, discount, grandTotal) but use server response as source of truth.
- Feature flag: hide advanced form or mock data if backend unavailable.

## 7) Risks / gaps
- Backend may differ on fields/status enums/totals computation; guard with feature flag.
- Line item ID handling unknown; need to mirror backend expectations once known.
- Payments linkage editing likely disallowed; ensure read-only.
- Pagination/filters unknown; may need server-side params later.

## 8) Test checklist (when live)
- CRUD: create/update/delete invoice; list refreshes.
- Validation: bad UUIDs, missing required fields, non-numeric qty/price/discount blocked.
- Filters: status/date/business/client filter working.
- Line items: add/edit/remove; totals recalc; server returns totals consistent.
- Payments: displayed read-only; no edit attempts.
- 401 guard; single toasts; loading overlay during requests.

## 9) Decision log
- (Fill when backend details confirmed and feature flags decided.)
