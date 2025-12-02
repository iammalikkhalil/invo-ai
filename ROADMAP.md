# Invotick Web Roadmap (Current State + Next Steps)

## Status Overview (Auth Phase Done)
- Auth implemented with JWT cookies/localStorage, guard middleware, global Redux UI (toasts/loading/modals).
- Login/Signup/Verify OTP/Reset Password (3-step) fully wired to `https://api.invotick.com/api`.
- Google social login wired via Google Identity script using `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; Facebook remains manual token prompt placeholder.
- Responsive SCSS design system, global app shell hides nav on auth routes.

## Project Policies (must follow everywhere)
- Language: responses/logs in Roman Urdu when chatting; code comments short and meaningful only where needed.
- Online-only web: no offline cache; React Query short cache only; backend is source of truth.
- DTO parity: web models exactly mirror backend DTOs; client generates UUIDs on create.
- Token strategy: access-only now; ready for access+refresh toggle (env). Auth guard via cookies + middleware. Token names configurable via env and must stay in sync with middleware/token storage.
- Auth routes hidden chrome: header/footer hidden on auth pages; guard enforces redirects.
- Toast policy: single toast per error (dedupe in store); duration auto-dismiss; no global axios error toast—use page-level `notifyError` only.
- Logging policy: add targeted logs only when debugging a flow; remove duplicates; use console on client for UI flows and terminal for middleware.
- Assets: use placeholders in `public/images` and `public/icons`; no real assets committed.
- Config-driven: locales/currencies, social provider IDs, upload endpoints/limits, token mode all via env/config; easy to change without code churn.
- Folder structure: feature modules under `(auth)` etc.; no duplicate pages outside their groups.
- Security: no hardcoded secrets; env only. CORS handled on backend. Never bypass SSL/CORS in frontend.

## Environment Required
- `.env.local` (example in `.env.example`):
  - `NEXT_PUBLIC_API_BASE_URL=https://api.invotick.com/api`
  - `NEXT_PUBLIC_TOKEN_STRATEGY=access` (ready for access-refresh later)
  - `NEXT_PUBLIC_ACCESS_COOKIE_NAME=invotick_access_token`
  - `NEXT_PUBLIC_REFRESH_COOKIE_NAME=invotick_refresh_token`
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>`
  - `NEXT_PUBLIC_FACEBOOK_CLIENT_ID=<your-facebook-client-id>`
  - Upload + locale/currency settings as needed.
- After env changes: delete `.next`, restart `npm run dev`, clear cookies.

## Auth Flow Details
- Routes under `src/app/(auth)/...`:
  - Login (`/login`): Email + Password with eye toggle; toasts deduped.
  - Signup (`/signup`): Captures name/email/phone/password; stores email for OTP.
  - Verify OTP (`/verify-otp`): Shows stored email, only OTP input.
  - Reset Password: 3 steps
    - `/reset-password/request` → email only (sends OTP, stores email)
    - `/reset-password/verify` → OTP only (shows email, stores OTP)
    - `/reset-password/new` → new password + confirm (uses stored email+OTP)
- Middleware (`src/middleware.ts`) enforces auth; nav/header hidden on auth routes.
- Axios client logs request/response/error; loading overlay driven by interceptors.
- Toasts: deduped by title/description/level; auto-dismiss with progress bar.

## Remaining Phases (deep detail, 1–5)

### 1) Profile & Settings (fully live)
- Endpoints: `/api/profile/me` (GET), `/api/profile` (PUT), `/api/profile/password` (PUT).
- Fields:
  - Profile: username, email (read-only), phoneNumber, address, country/state/city, profilePictureUrl (upload when backend ready), notificationToken.
  - Password: oldPassword, newPassword (min 8, strength meter optional).
- UI:
  - Screen: Profile form with inline validation; Password change section.
  - Components: Avatar uploader (multipart-ready), AddressInputs, PasswordInput (eye toggle), Submit buttons with loading states.
  - Toasts: single success/error; auto-dismiss.
- State: React Query fetch for `/me`; mutations for update/password; Redux only for auth state.
- Validation: zod schemas mirroring backend types; required/optional exactly as DTOs.
- Responsiveness: single-column mobile, two-column desktop.

### 2) Master Data (tax/unit/category/terms/payment instructions)
- Endpoints:
  - Taxes: `/api/master-data/taxes` (and legacy `/api/taxes` if needed).
  - Units: `/api/master-data/units`.
  - Categories: `/api/master-data/categories`.
  - Terms: `/api/terms`.
  - Payment Instructions: `/api/payment-instructions` (fieldsJson).
- Fields: all IDs UUID (client-generated), name required; terms (title, description?); payment instructions (fieldsJson string).
- UI:
  - Screens: separate list views per type with create/edit drawers.
  - Components: DataTable (sort/filter/search), DrawerForm with UUID prefill, Confirm delete modal, JSON editor for fieldsJson.
- Validation: UUID format check, required name/title, JSON parse check for fieldsJson.
- Behavior: Soft delete where supported; reflect backend constraints; toasts per action.

### 3) Business & Clients
- Endpoints: `/api/businesses` (CRUD), `/api/clients?businessId=...` (CRUD + list by business).
- Fields:
  - Business: id (UUID), name required, logo (upload), shortName, licenseNumber, businessNumber, phone, emailAddress, website, addressLine1/2, city/state/zipcode/country.
  - Client: id (UUID), businessId (UUID), name required, emailAddress, phone, address lines, city/state/zipcode/country, companyName, clientId, faxNumber, additionalNotes, rating, openingBalance, credit.
- UI:
  - Business switcher scopes downstream data.
  - Business detail/list + create/edit drawer.
  - Client list filtered by business, detail drawer, create/edit form.
  - Monetary fields formatted via locale/currency config.
- Validation: UUIDs, required name, email format, numeric for balances/rating.
- Behavior: Soft delete; toasts single per action; loaders on mutations.

### 4) Inventory/Products
- Endpoint: `/api/inventory-items` (CRUD).
- Fields: id (UUID), name required, description, unitPrice, netPrice, discount, discountType, taxId?, unitTypeId?, itemCategoryId?.
- UI:
  - List/grid with sort/filter, search.
  - Detail drawer, create/edit drawer.
  - Selectors for tax/unit/category populated from master data.
  - Price/discount inputs with currency formatting.
- Validation: UUIDs, required name, numeric price/discount, optional linked IDs validated for UUID shape.
- Behavior: Soft delete; single toast per error/success; loading overlay on requests.

### 5) Payments
- Endpoint: `/api/payments` (CRUD).
- Fields: id (UUID), businessId (UUID), clientId (UUID), paymentNumber, amount, paymentDate (ISO), paymentInstructionId?, referenceNumber?, notes?, status?, invoicePayments[] (id, invoiceId, amountApplied), customerCredit?.
- Constraint: Backend update cannot modify invoice links; UI must disable link edits or show limitation.
- UI:
  - List + detail view (show linked invoice payments), create/edit drawer.
  - PaymentInstruction select, Apply credit control, status badge.
  - Monetary/Date inputs with locale formatting.
- Validation: UUIDs, required business/client/paymentNumber/amount/paymentDate, invoicePayments items require UUIDs and numeric amounts.
- Behavior: Single toast per result; loading overlay during mutations; guard against link edits until backend supports.

### 6) Invoices (backend pending; assumed until live)
- Assumed endpoints: `/api/invoices` (list/detail/create/update/delete).
- Fields (derive from KMP): id (UUID), businessId (UUID), clientId (UUID), invoiceNumber, status (draft/sent/paid/overdue), issueDate, dueDate, line items (id, itemId?, description, qty, price, taxId?, discount?), termsId?, paymentInstructionId?, notes, currency, totals (subtotal, tax, discount, grandTotal).
- UI:
  - List with filters (status/date range/business/client), search.
  - Detail: line items, taxes/terms, totals, status badge, linked payments, actions (send/share/PDF when available).
  - Create/edit form with dynamic line items, selectors for tax/term/payment instruction, currency formatting; feature-flag until API live.
- Validation: UUIDs, required business/client/status/dates; numeric qty/price/tax; totals computed client-side but server authoritative.
- Behavior: Single toast; loading overlay; disable payment link edits unless backend supports.

### 7) Expenses (backend pending; assumed until live)
- Assumed endpoints: `/api/expenses` CRUD.
- Fields (derive KMP): id (UUID), businessId, categoryId?, amount, taxId?, date, vendor, notes, attachments, paymentMethod?, status?, currency.
- UI:
  - List with filters (date range, category, vendor), search.
  - Detail: attachments list/download.
- Create/edit drawer with attachment uploader (multipart-ready); feature-flag until API live.
- Validation: UUIDs, required amount/date; enforce file type/size from env.
- Behavior: Single toast; loading overlay.

### 8) Reports (backend pending; assumed until live)
- Assumed endpoints: `/api/reports/summary?type={pnl|tax|cashflow}&from=&to=&businessId=` and `/api/reports/export?type=&format=pdf|csv&from=&to=&businessId=`.
- Types (derive KMP): P&L, tax, cashflow; filters (date range, business).
- UI: filters panel, KPI cards, tables, export buttons; feature-flag until API live; “coming soon” toast if blocked.
- Validation: required date range; business selection.

### 9) Dashboard
- Data: payments now; plug invoices/expenses/reports when live.
- UI: KPI cards, recents (payments/invoices/clients/items), quick actions; React Query short cache; skeletons; responsive grid.

### 10) Language/Onboarding
- Locale selector (env-driven list), persisted locally; affects formatters.
- Onboarding steps per KMP (language + business setup); call backend if endpoints exist else local-only.
- Splash: auth check → redirect.

### 11) UX/Assets
- SCSS design system continues: responsive flex/grid, form/table styles; avoid unnecessary media queries.
- Components: PasswordInput (eye toggle), DatePicker, Number/CurrencyInput, Select/Autocomplete, Search/Pagination, Drawers/Modals, Empty states with placeholders.
- Assets: placeholders in `public/images` and `public/icons` with `.txt` lists; you add real assets later.
- Global UI: toasts/modals/loader via Redux; single-toast policy enforced.

### 12) Hardening
- Env-only secrets; no hardcoded creds. Business scoping; validation (UUID/date/money).
- Token strategy toggle for refresh later; guard via middleware + cookies.
- Error handling: `useApiError` only (no global axios toast); toast dedupe enabled.
- Security: respect CORS/SSL; frontend won’t bypass.

### 13) Testing & Delivery
- CI: lint/typecheck (already green). Add unit tests (utils/hooks), component tests (forms), smoke/e2e when backend stable.
- Docker (web-only): multi-stage Dockerfile, runtime `next start`, non-root; optional dev compose for web only; backend external.
- Deploy: env per stage; reverse proxy for SSL; healthcheck via Next.

## Assumed Endpoints (until backend ships)
- Invoices: GET/GET{id}/POST/PUT/DELETE `/api/invoices`
- Expenses: GET/GET{id}/POST/PUT/DELETE `/api/expenses`
- Reports: `/api/reports/summary` and `/api/reports/export` (type, format, date range, businessId)
- Upload: POST `/api/uploads` multipart → { url, id }
Logged in `web/assumed-endpoints.txt`.

## Backend Locations (for reference)
- Backend: `c:\backend\invotickApis`
- KMP app (contracts): `c:\backend\InvotickProject`
- Web: `c:\backend\Web\codex\web`

## Known Constraints
- Backend `/api/payments` update cannot change invoice links (UI must block/warn).
- Invoices/Expenses/Reports missing on backend; feature-flag UIs until live.
- Social login: Google wired; Facebook still prompt-based unless SDK flow added.
