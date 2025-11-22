Contract checklist (to be filled as endpoints are finalized):

- Auth: align with backend DTOs (login/signup/otp/reset/social). DONE (backend).
- Profile/Settings: /profile/me, /profile, /profile/password. DONE (backend).
- Master Data: taxes/units/categories/terms/payment-instructions. DONE (backend).
- Business: /businesses. DONE (backend).
- Clients: /clients (by business). DONE (backend).
- Inventory: /inventory-items. DONE (backend).
- Payments: /payments. DONE (backend; note: update cannot modify invoice links).
- Invoices: PENDING (derive from KMP; add API spec).
- Expenses: PENDING (derive from KMP; add API spec).
- Reports: PENDING (derive from KMP; add API spec).
- Uploads: define path/limits/types for multipart uploads.
- Locales/Currencies: list-driven; update env/config when finalized.
- Token strategy: access-only now; switchable to access+refresh in auth config.
