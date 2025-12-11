# Business & Clients Phase – Comprehensive Plan

This doc captures backend contracts, KMP expectations, current web state, contradictions, and the implementation plan for the Business & Clients phase.

---

## Purpose: Web vs KMP
- **Web:** Online-only, rich CRUD admin; immediate API refetch after mutations; scoped by selected business; validation/toasts/loading; no offline cache.
- **KMP:** Likely richer fields and offline caching; may assume stable IDs and local sync. Web must stick to backend schema to avoid 400s.

---

## Backend Reality (Spring)
- Endpoints:
  - Businesses: `POST/GET/PUT/DELETE /api/businesses`
  - Clients: `POST/GET/PUT/DELETE /api/clients?businessId=UUID` (list filtered by business)
  - Get by id also available for both.
- DTOs (requests):
  - BusinessRequest:
    - `id` (UUID string, required)
    - `name` (required)
    - Optional: `logo`, `shortName`, `licenseNumber`, `businessNumber`, `phone`, `emailAddress`, `website`, `addressLine1/2`, `city`, `state`, `zipcode`, `country`
  - ClientRequest:
    - `id` (UUID string, required)
    - `businessId` (UUID string, required)
    - `name` (required)
    - Optional: `emailAddress`, `phone`, `addressLine1/2`, `city`, `state`, `zipcode`, `country`, `companyName`, `clientId`, `faxNumber`, `additionalNotes`
    - Optional numeric: `credit` (BigDecimal), `rating` (Int), `openingBalance` (BigDecimal)
- Responses:
  - BusinessResponse: mirrors fields + `id`, `userId`, `createdAt`, `updatedAt`.
  - ClientResponse: mirrors fields + `businessId`, `credit`, `openingBalance`, timestamps.
- Behavior:
  - Soft delete is implied (service method name), but verify in code; DELETE endpoints exist.
  - Update appears to be in-place (unlike master-data new-UUID rule). No requirement to change id on update.
  - Validation: UUID format, name not blank; other fields optional; email/phone not validated server-side (client should validate).
  - List clients requires `businessId` query param.
  - Logo: string field only; no upload endpoint shown (no multipart in controller).

---

## KMP Expectations (likely)
- May show richer UX: business logo upload/display, rating widgets, monetary formatting, filters, stable IDs, possibly tags/status.
- Offline/local caching and stable IDs on update.
- Could include stricter validation (email/phone) and more fields than backend currently exposes.

---

## Contradictions / Gaps
- **Logo upload:** Backend only has `logo: String?`; no upload endpoint. Web should not attempt multipart; allow URL text or disable upload with info message.
- **Field richness:** If KMP uses tags/status/extra metadata, backend lacks them; web must omit or mark as future.
- **Validation:** Backend minimal; web must enforce email/phone/UUID/numeric client-side.
- **Pagination/sorting:** Not in controller; if missing, do client-side search/filter.
- **Update semantics:** Backend seems in-place; do NOT regenerate UUIDs (unlike master-data). If KMP assumes stable IDs, we’re aligned.

---

## Web Implementation Plan
1) DTOs & Schemas
   - Add `src/types/dto/business.ts` for Business/Client request/response.
   - Add zod schemas: UUID required, name required, email regex, phone regex, URL for website, numeric for rating/credit/openingBalance.

2) Services & Hooks
   - `src/services/businesses.ts`: list/create/update/delete/getById.
   - `src/services/clients.ts`: list (businessId required), create/update/delete/getById.
   - React Query hooks: `useBusinesses`, `useBusinessMutations`, `useClients(businessId)`, `useClientMutations`; keys: `["businesses"]`, `["clients", businessId]`.

3) State
   - Selected businessId stored in Redux slice or context for scoping clients and downstream data; persist in localStorage.

4) UI/Pages
   - Single page `src/app/businesses/page.tsx` (or `/master-data/business-clients`) containing:
     - Business section: table + search, create/edit drawer, delete confirm.
     - Business switcher: select current business; defaults to first in list.
     - Client section: filtered by selected business; table + search, create/edit drawer (businessId locked), delete confirm.
   - Detail preview optional (side panel or drawer view).
   - Monetary fields formatted per locale/currency config for credit/openingBalance.

5) Forms & Validation
   - Business form: UUID, name (min length), optional fields, website URL validation, email/phone validation.
   - Client form: UUID, businessId (read-only/select from switcher), name required, email/phone, rating numeric, credit/openingBalance numeric, other optional fields.
   - Disable submit while pending; inline errors; single toast on success/error; refetch after mutations.

6) Behavior
   - Mutations invalidate respective queries:
     - Businesses → invalidate `["businesses"]` and clients of selected business.
     - Clients → invalidate `["clients", businessId]`.
   - Delete uses DELETE endpoints; assume soft delete; no restore UI.
   - No upload: show text input for logo URL or a note “logo upload not supported yet” to avoid failing calls.

7) UX/Design
   - Follow existing master-data styling/components (table, drawer, delete confirm).
   - Keep sections on one page for quick admin; responsive layout.
   - Clear note if backend limitations exist (e.g., “logo upload not available; provide URL”).

8) Testing Checklist
   - Create/update/delete business; list refreshes; selection updates clients query.
   - Switch business; clients list changes accordingly.
   - Create/update/delete client under selected business; list refreshes.
   - Validation blocks bad UUID/email/phone/URL/numeric; errors displayed inline.
   - 401 guard works via middleware.

9) Risks & Mitigations
   - Upload absent: avoid file inputs; use URL or stub; add info note.
   - Pagination absence: handle large lists with client-side search; add pagination later if backend supports.
   - Backend field drift: keep DTOs aligned; don’t send extra fields.
   - Numeric precision: use number inputs and parse to string/number per API expectations; avoid locale formatting in payload.

---

## File Map (to create/update)
- Types: `src/types/dto/business.ts`.
- Services: `src/services/businesses.ts`, `src/services/clients.ts`.
- Hooks: `src/hooks/useBusinesses.ts`, `src/hooks/useClients.ts` (or consolidated).
- State: selected business slice/context (e.g., `src/store/slices/businessSlice.ts`).
- Page: `src/app/businesses/page.tsx` (or `/master-data/business-clients`).
- Components: shared table/drawer/delete confirm (reuse master-data); forms for business/client; business switcher.
- Styles: reuse existing master-data styles; add minimal tweaks if needed.
