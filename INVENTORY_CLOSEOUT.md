# Inventory / Products Phase – Close-out

## What was built
- Added inventory navigation entry and `/inventory-items` page with list/search, create/edit drawer, and delete confirm wired to backend.
- Implemented DTO + zod schema for inventory items (`src/types/dto/inventory.ts`) including nested tax/unit/category objects.
- Services/hooks (`src/services/inventoryItems.ts`, `src/hooks/useInventoryItems.ts`) for list/create/update/delete with React Query invalidation.
- UI resolves related names from nested response data and falls back to master data lists; toasts/loading via existing global pattern.

## Key decisions
- Update in place (no new UUID on edit) to match backend semantics.
- Discount type constrained to PERCENT/FLAT in UI but sent as free string to stay compatible with backend.
- Related selectors pull from master-data hooks; when the API returns nested objects (`tax`, `unitType`, `itemCategory`), those names are displayed directly.
- Validation: UUID regex for ids, required name, non-negative numeric prices, optional discount/related ids.

## Contradictions / gaps
- Backend response uses nested related objects but update/create expects ids; UI handles both but assumes ids stay source of truth.
- No pagination/sorting; using client-side search only.
- No inline backend error mapping (field-level) beyond toast; relies on client validation.

## Tests / verification
- Manual: UI rendering and table display with nested related names. No automated tests run. Suggested: `npm run lint` and `npm run typecheck`.

## Follow-ups
- Add pagination/sorting if backend supports.
- Add field-level error surfacing for backend validation messages.
- Consider currency/number input components for better UX on prices/discounts.
