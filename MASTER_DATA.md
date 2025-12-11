# Master Data Module (Taxes, Units, Categories, Terms, Payment Instructions)

This doc explains the exact requirements, what the KMP app does, what the backend actually supports today, what the web app currently implements, and where the gaps/contradictions are. Use this to keep web aligned with backend while noting KMP differences.

---

## Purpose (web vs KMP)
- **Web:** Online-only, rich CRUD admin for master data (no offline/cache). Expect full forms, validation, and immediate API refetch to confirm actions.
- **KMP (mobile):** Offline/quick entry; richer field sets (e.g., tax rate, unit abbreviations, category types/colors, payment instruction labels) and local caching/sync.
- Implication: Web must respect backend’s minimal schema to avoid 400s; KMP-only fields cannot be sent until backend extends.

---

## Backend reality (current Spring contracts)
- Endpoints (no legacy fallbacks):
  - Taxes: `POST/GET/PUT/DELETE /api/master-data/taxes`
  - Units: `POST/GET/PUT/DELETE /api/master-data/units`
  - Categories: `POST/GET/PUT/DELETE /api/master-data/categories`
  - Terms: `POST/GET/PUT/DELETE /api/terms`
  - Payment Instructions: `POST/GET/PUT/DELETE /api/payment-instructions`
- DTO fields (minimal):
  - Tax: `{ id: UUID, name: string }` → `{ id, name }`
  - Unit: `{ id: UUID, name: string }` → `{ id, name }`
  - Category: `{ id: UUID, name: string }` → `{ id, name }`
  - Terms: `{ id: UUID, title: string, description?: string }` → `{ id, title, description? }`
  - Payment Instruction: `{ id: UUID, fieldsJson: string }` → `{ id, fieldsJson }`
- Behavior:
  - Soft delete on DELETE (isDeleted).
  - Update (all five): soft-deletes old row, **creates new row with the request.id**. Sending same id as path → 400 (ID exists). So every edit must send a new UUID.
  - Validation: UUID format, name/title required, fieldsJson required string; server does not parse/validate fieldsJson structure.
- Missing (backend does NOT support): tax rate, unit abbreviation, category type/color/parent, payment instruction name/title/label, any display fields beyond the above.

---

## KMP behavior (reference)
- Uses richer schemas:
  - Taxes often include rate (%), maybe defaults.
  - Units often include abbreviation (kg, pcs).
  - Categories may have types/colors/hierarchy.
  - Payment instructions use method-based dynamic fields (see PaymentFieldConfig) and show a friendly name/label.
- Offline/local caching and possibly stable IDs on update (likely does not force new UUID per edit).
- Thus, KMP data model is richer than backend, and update semantics differ (backend forces new UUID).

---

## Current Web implementation (what’s built)
- Single-page master data hub: `src/app/master-data/page.tsx` renders five sections (Taxes, Units, Categories, Terms, Payment Instructions).
- Each section uses:
  - Data table with search.
  - Drawer for create/edit (UUID prefilled; edit generates new UUID, shows note).
  - Delete confirm modal.
  - Client-side validation (UUID format; name/title min length; payment instructions field validation by type).
  - React Query for list + mutations; invalidates and refetches after create/update/delete.
  - Toasts per action; loading states on tables and submits.
- Services/hooks:
  - DTOs: `src/types/dto/masterData.ts`.
  - Services: `src/services/masterData/{taxes,units,categories,terms,paymentInstructions}.ts`.
  - Hooks: `src/hooks/useMasterData.ts` (keys, list hooks, mutations).
- Payment instructions (web):
  - Method selector with dynamic fields mirroring KMP `PaymentFieldConfig` methods (CASH/BANK_TRANSFER/CREDIT_CARD/PAYPAL/STRIPE/CHEQUE/MOBILE_WALLET/CRYPTO/OTHER).
  - Validates required fields, email, phone.
  - Serializes payload as `fieldsJson = {"method": "...", "values": {...}}` for backend.
  - Parses existing fieldsJson on edit to prefill method/values.
- Styling: drawer/modal overlays fixed, no click-through; master-data styles in `src/styles/components/_master-data.scss`.
- Navigation: single “Master Data” nav entry → `/master-data`. Individual section routes remain usable.

---

## Contradictions / Gaps (KMP vs Backend vs Web)
- **Field richness:** KMP uses tax rate, unit abbreviations, category types/colors, PI labels. Backend only accepts name/title and fieldsJson. Web must stay minimal; cannot send KMP-only fields until backend extends.
- **Update semantics:** Backend requires new UUID per edit (soft-delete old + create new). KMP likely edits in place with stable IDs. Web follows backend rule; this may diverge from KMP expectations.
- **Payment instruction label:** Backend lacks a display name/title; web shows ID + method, but UX is limited. KMP likely shows friendly labels.
- **Server validation:** Backend does not parse fieldsJson; web does client-side validation for required fields per method, but server won’t enforce structure.
- **Soft delete visibility:** Lists already filter deleted; no restore/undo path implemented.

---

## What’s still missing / nice-to-haves
- Backend extensions: add rate/abbr/category attributes and PI name/title to align with KMP; otherwise web remains minimal.
- Stable edit flow: backend change to allow same ID on update (or an explicit versioning field) to reduce confusion.
- Better display for payment instructions: server-provided name/title; UI chips for method/keys.
- Error mapping: surface backend 400 messages inline per field if backend adds richer validation.
- Tests: add integration tests for CRUD flows and validation for each section.

---

## How to operate (web)
- Create/edit:
  - Tax/Unit/Category/Terms: must send new UUID on edit; web auto-generates and shows note.
  - Payment instructions: pick method, fill required fields; we build JSON; UUID regenerated on edit.
- Delete: soft delete; list refetches after mutation.
- Validation:
  - Names/titles min 2 chars; UUID format check.
  - PI: required fields per method, email/phone format checks.
- Refresh: React Query invalidation ensures list reload after every mutation.

---

## Risks and reminders
- Do not add KMP-only fields to payload until backend supports them; will 400.
- Educate users about “new UUID on edit” behavior (backend constraint).
- Payment instruction UX remains limited without backend label/name; consider backend change.
- fieldsJson structure is client-enforced only; server will store any string—keep client validator strict.

---

## File map (web)
- Page: `src/app/master-data/page.tsx` (all sections together).
- Sections: `.../taxes/page.tsx`, `.../units/page.tsx`, `.../categories/page.tsx`, `.../terms/page.tsx`, `.../payment-instructions/page.tsx`.
- Services: `src/services/masterData/*`.
- Types: `src/types/dto/masterData.ts`.
- Hooks: `src/hooks/useMasterData.ts`.
- Components: `src/components/master-data/*` (table, drawer, delete confirm, UUID field).
- Styles: `src/styles/components/_master-data.scss`.
