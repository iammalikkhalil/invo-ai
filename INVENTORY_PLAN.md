# Inventory/Products Phase – Plan (per plan.md flow)

This doc is the phase-specific plan. Fill answers, then implement, test, and close out.

---

## 1) Scope & Acceptance Criteria
- Scope: Inventory Items CRUD via `/api/inventory-items`.
- Fields (backend): `id (UUID, required)`, `name (required)`, `description?`, `unitPrice (required)`, `netPrice (required)`, `discount?`, `discountType?`, `taxId?`, `unitTypeId?`, `itemCategoryId?`.
- UI: list/grid with search/sort; detail + create/edit drawer; selectors for tax/unit/category (from master data); price/discount inputs with currency formatting; delete confirm.
- Acceptance (must have):
  - Live API CRUD works.
  - Validation blocks bad UUID/missing name/non-numeric prices/discount/related IDs.
  - List refetches after mutations.
  - Single toast per action; loading overlay during requests.
  - Routes guarded (middleware already).

## 2) KMP (to verify)
- Likely supports tax/unit/category selection, discount types; may have extra fields (SKU/stock qty/barcode). If present, backend lacks → defer.
- Likely stable IDs (in-place update), offline cache. Web stays online-only.

## 3) Backend Reality (from code)
- Controller: `InventoryItemController`.
- Request: `InventoryItemRequest` with UUID id, name required, description?, unitPrice (BigDecimal), netPrice (BigDecimal), discount?, discountType?, taxId?, unitTypeId?, itemCategoryId? (UUID-validated).
- Response: `InventoryItemResponse` with fields + related objects `tax`, `unitType`, `itemCategory`.
- Behavior: soft delete; update in-place (no new UUID); no pagination observed; discountType free-form string.

## 4) Contradictions Table
- | Field/Behavior | KMP | Backend | Web decision |
- | Extra fields (SKU/qty/barcode) | Likely yes | Not present | Omit; note as future |
- | discountType enums | Likely predefined | Free-form string | Offer safe options (PERCENT/FLAT), send string, allow unknown on display |
- | Offline/cache | Yes | N/A | Online-only |

## 5) Web Objectives
- Implement only backend fields; online-only; stable IDs on update (no regeneration).
- UX: list + search/filter; drawer create/edit; delete confirm; currency display for price/discount.
- Validation: UUIDs (id + related IDs), required name, numeric price/discount, optional linked IDs must be UUID shape.
- Refetch after mutations; single toasts; loading overlay from interceptor.

## 6) Implementation Plan
- Types/Schemas: add `src/types/dto/inventory.ts` with zod (UUID regex, number coercion).
- Services/Hooks: `src/services/inventoryItems.ts` CRUD; `useInventoryItems` hooks with keys/invalidation.
- UI/Page: route `/inventory-items` (or `/products`):
  - Table with columns: name, unitPrice, netPrice, discount+type, tax/unit/category names.
  - Drawer create/edit: UUID, name, description, unitPrice/netPrice, discount, discountType select (predefined list), selects for tax/unit/category from master data; disable if master lists empty.
  - Detail view optional; delete confirm modal.
- Data deps: reuse master data hooks for taxes/units/categories.
- State: React Query only.
- Formatting: display currency via existing locale/currency config; store as numbers.

## 7) Risks / Gaps
- Missing KMP-only fields → document and defer.
- discountType free-form → constrain UI, send string.
- No pagination → client search; add pagination later if needed.
- Empty master data → show helper text/disable selectors.

## 8) Test Checklist
- CRUD: create/update/delete succeeds; list refreshes.
- Validation: bad UUID/related IDs, missing name, non-numeric price/discount are blocked.
- Selectors populate from master data; empty state handled.
- 401 guard intact; toasts single-fire; loading overlay active during requests.

## 9) Decision Log
- (Fill when answers/choices are locked; include timestamps.)
