# Payments Phase – Plan (per plan.md flow)

This doc is the phase-specific plan. Fill answers, then implement, test, and close out.

---

## 1) Scope & Acceptance Criteria
- Scope: Payments CRUD via `/api/payments`.
- Fields (backend per roadmap): `id (UUID, required)`, `businessId (UUID, required)`, `clientId (UUID, required)`, `paymentNumber (required)`, `amount (number, required)`, `paymentDate (ISO string, required)`, `paymentInstructionId?`, `referenceNumber?`, `notes?`, `status?`, `customerCredit?`, `invoicePayments[]` with `id`, `invoiceId`, `amountApplied`.
- Constraints:
  - Backend update cannot modify invoice links; UI must disable link edits or clearly warn.
  - Online-only; no offline cache.
- Acceptance (must have):
  - Live API CRUD works.
  - Validation blocks bad UUIDs/missing required fields/non-numeric amounts.
  - List refetches after mutations.
  - Single toast per action; loading overlay during requests.
  - Routes guarded (middleware already).
  - UI makes invoice links read-only on edit.

## 2) KMP (assumptions to verify)
- KMP likely supports richer payment statuses and editing invoice links; may have offline cache.
- May compute applied credits and show invoices inline; confirm if backend exposes totals or status enums.
- Expect stable IDs (in-place update).

## 3) Backend Reality (to confirm in code)
- Controller: `/api/payments` CRUD; verify if `PUT` rejects invoicePayments changes.
- DTOs: PaymentRequest/Response with invoicePayments nested objects.
- Behavior: soft delete? pagination? filters (business/client/date)? status enum? Sorting?
- Validation messages: UUID format? required fields? amount numeric?

## 4) Contradictions Table
- | Field/Behavior | KMP | Backend | Web decision |
- | Invoice link edit | Likely allowed | Not allowed | Make invoicePayments read-only on edit; only show list |
- | Status enums | Possibly rich | Unknown | Use backend enum if present; else simple badge from response |
- | Pagination/sorting | Unknown | Unknown | Client search initially; add server filters if available |
- | Offline cache | Yes (likely) | N/A | Online-only |

## 5) Web Objectives
- Implement backend-supported fields only; online-only.
- UX: list + search/filter (client-side initially), detail view (invoicePayments), create/edit drawer, delete confirm.
- Validation: UUIDs, required business/client/paymentNumber/amount/paymentDate, numeric amounts, invoicePayments UUIDs + numbers.
- Respect constraint: invoicePayments read-only on edit; show note/toast.

## 6) Implementation Plan
- Types/Schemas: add `src/types/dto/payments.ts` with request/response + zod schemas for form; include invoicePayments.
- Services/Hooks: `src/services/payments.ts` CRUD; React Query hooks `usePayments`, `usePaymentMutations` (keys: `["payments"]` + filters).
- UI/Page: route `/payments`
  - Table columns: paymentNumber, amount, date, business/client, status, applied count.
  - Detail drawer/side panel: invoicePayments list (id, invoiceId, amountApplied), referenceNumber, notes, paymentInstruction, customerCredit.
  - Create drawer: UUID, business select, client select (scoped by business), paymentNumber, amount, paymentDate, paymentInstruction select (from master data), referenceNumber, notes, status select (enum if known).
  - Edit drawer: same fields but invoicePayments section read-only (display only).
  - Delete confirm modal.
- Data deps: reuse businesses/clients hooks; paymentInstructions master data hook; format amounts/dates via formatter hook.
- State: React Query only; local component state for forms; business selection drives client list.
- Validation: zod schema; block submit on errors; single toast on success/error.

## 7) Risks / Gaps
- Unknown status enums; treat status as free string until confirmed.
- InvoicePayments immutability: ensure UI blocks edits; backend may still reject.
- Pagination/filters unknown; large lists may need server-side params later.
- Precision for amounts: use number inputs but send numeric; watch for rounding.

## 8) Test Checklist (manual)
- CRUD: create/update/delete payment; list refreshes.
- Validation: bad UUIDs, missing required fields, non-numeric amounts blocked.
- Business/client dependency: client list scoped by business; paymentInstruction select populated.
- Edit: invoicePayments displayed read-only; attempting to save without change succeeds.
- 401 guard intact; toasts single-fire; loading overlay active during requests.

## 9) Decision Log
- (Fill when answers/choices are locked; include timestamps.)
