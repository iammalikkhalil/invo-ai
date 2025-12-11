# Settings Module (Invotick Web)

This document explains how settings and profile functionality currently work in the Invotick web app, what is implemented, what is missing, and how to evolve the architecture for production.

---

## Overview
- **Scope:** Profile settings (personal info, notification token), read/write to backend, local UI state, and auth-linked identity shown in the shell (sidebar profile).
- **Tech stack:** Next.js App Router (client components), React Query for data fetching/mutations, Redux for auth/user state, localStorage for user caching, Axios API client with interceptors.
- **Primary UI:** `src/app/settings/page.tsx` renders profile form + password placeholder + avatar picker (local preview only).
- **Data flow:** `fetchProfile` → hydrate form and Redux user; `updateProfile` → PUT to backend then update Redux + localStorage; avatar is preview-only (no upload).

---

## Settings Inventory (Implemented vs Missing)

| Setting / Feature                           | Status           | UI Location / Code                                     | Backend Path                  | Notes |
|---------------------------------------------|------------------|--------------------------------------------------------|-------------------------------|-------|
| View profile (name/email/phone/address etc) | Implemented      | `src/app/settings/page.tsx` (React Query `fetchProfile`) | `GET /profile/me`             | Hydrates form + Redux + localStorage. |
| Edit profile (name/phone/address/city/state/country/notificationToken) | Implemented | `src/app/settings/page.tsx` → `updateProfile` mutation | `PUT /profile`                | On success updates Redux + localStorage. |
| Notification token field                    | Implemented (manual entry) | Same form                                              | `PUT /profile` (field included) | No validation; user-entered string. |
| Avatar display (NameAvatar fallback)        | Implemented      | `src/components/ui/name-avatar.tsx`, used in sidebar/profile picker | N/A                           | Deterministic initials + color; no upload. |
| Avatar selection (local preview)            | Partially implemented | `src/components/profile/AvatarPicker.tsx`              | N/A                           | Local preview only; warns not saved. |
| Avatar upload to backend                    | Missing           | N/A                                                    | N/A                           | Backend upload not wired; feature intentionally disabled. |
| Password change                             | Missing (placeholder) | Card in `settings/page.tsx` with “Coming soon”         | N/A currently                 | No fields/flows; blocked pending backend. |
| Profile picture persistence                 | Missing           | Preview only                                           | Backend unsupported           | Backend `ProfileUpdateRequest` currently omits image. |
| Profile deletion / account closure          | Missing           | N/A                                                    | N/A                           | Not designed. |
| Locale / currency preferences               | Missing (config only) | Env defaults in `.env.example` (`NEXT_PUBLIC_LOCALES`, `NEXT_PUBLIC_CURRENCIES`) | N/A | Not surfaced in UI. |
| Theme selection                             | Missing           | N/A                                                    | N/A                           | Theme via `next-themes` but no setting in UI. |
| Notification preferences (toggles)          | Missing           | N/A                                                    | N/A                           | Only free-text notification token. |
| Session/security settings (device list, logout all) | Missing | N/A                                                   | N/A                           | Not implemented. |

---

## How Things Work (Code References)

### UI & Forms
- **Settings page:** `src/app/settings/page.tsx`
  - React Query `useQuery` `["profile"]` → `fetchProfile` (GET `/profile/me`).
  - `react-hook-form` + Zod schema for validation of name and optional fields.
  - `useMutation` `updateProfile` (PUT `/profile`) for save.
  - On success: invalidates `["profile"]`, dispatches `setUser`, saves user to localStorage, shows toast.
  - Avatar: `AvatarPicker` renders current `avatarPreview` (from profile or upload); selecting a file sets preview and warns that avatar is not synced.
  - Password card: static text “Coming soon”.

- **Avatar components:**
  - `src/components/ui/name-avatar.tsx`: Deterministic initials + color variants, used across app (sidebar, avatar picker fallback).
  - `src/components/profile/AvatarPicker.tsx`: Local file input, preview, toast warning; no upload call.
  - Styles: `src/styles/components/_avatar.scss` (imported in `src/styles/main.scss`).

- **Shell integration:**
  - Sidebar profile: `src/components/layout/sidebar-nav.tsx` reads `state.auth.user` (Redux) and shows `NameAvatar`, name, email.
  - App shell hides chrome on auth routes: `src/components/layout/app-shell.tsx`.

### Data & Services
- **Profile DTOs:** `src/types/dto/profile.ts`
  - `Profile` fields: id, username, email, phoneNumber, address, country, state, city, profilePictureUrl (nullable), notificationToken (nullable), isVerified (optional).
  - `UpdateProfileRequest` fields mirror editable fields (includes `profilePictureUrl` but backend currently not supporting upload).

- **Profile service:** `src/services/profile.ts`
  - `fetchProfile`: GET `/profile/me`, logs start/success.
  - `updateProfile`: PUT `/profile`, logs start/success.
  - `updatePassword`: defined but not used in UI (backend support pending).

- **State & Persistence:**
  - Redux slice: `src/store/slices/authSlice.ts` with `user`, tokens, strategy.
  - Local user storage: `src/services/auth/userStorage.ts` (`saveUser`, `loadUser`, `clearUser`) stored as `invotick_user` in localStorage.
  - Tokens storage: `src/services/auth/tokenStorage.ts` writes tokens to localStorage + cookies (names from env).
  - Providers hydration: `src/app/providers.tsx`
    - On mount: load cached user from localStorage into Redux.
    - Load tokens; if tokens exist, fetch profile, update Redux + localStorage; on failure clear tokens + user + toast.
  - Logout: `src/services/auth/logout.ts` clears tokens + user + redirects to `/login`.
  - Axios interceptors: `src/services/api.ts` add Bearer token, start/stop loading, clear auth+user on 401.

### Validation & UX
- Zod schema in `settings/page.tsx` ensures `username` present; other fields optional.
- Toasts via `pushToast` on success/warnings/errors; deduped by UI slice (see `ToastHost`).
- Loading overlay driven by `uiSlice` start/stop in Axios interceptors.

---

## Feature Status Details

### Fully Implemented
- **Profile read/write (non-avatar):** Name, phone, address, city, state, country, notificationToken.
- **Hydration:** Profile cached locally and restored on reload; refreshed from backend if tokens present.
- **Sidebar identity:** Uses Redux user (hydrated from storage) for name/email/avatar initials.

### Partially Implemented
- **Avatar workflow:** UI selection + preview + warning toast. No persistence to backend; uses NameAvatar fallback when missing.
- **Notification token:** Captured as free text; no validation or device binding; not used elsewhere.
- **Password change:** Service stub exists but UI disabled; waiting on backend.

### Missing or Not Surfaced
- Avatar upload/storage with backend (multipart upload endpoint absent).
- Password change UI/flow (old password removed per requirement; currently no new/confirm fields).
- Theme, locale, currency selection (env-only defaults).
- Session management (logout all devices), MFA, security logs.
- Profile deletion.
- Validation for phone/address fields (e.g., formats/country choices).

---

## Known Issues / Gaps
- **Avatar persistence:** No backend support; `profilePictureUrl` unused. Users cannot save avatar to server.
- **Password management:** “Coming soon” only; users cannot change password from web.
- **Notification token semantics:** Free-text; may not align with backend expectations (device push tokens).
- **Error handling:** `updateProfile` errors surfaced via toast, but no field-level mapping; complex validation errors from backend are not split per field.
- **Offline/optimistic:** None; relies on live API.
- **UI discoverability:** Only one settings page; no tabs/sections for future settings (locale/theme/security).
- **Schema drift risk:** `UpdateProfileRequest` allows `profilePictureUrl`, but backend may reject unknown fields.
- **Accessibility:** File input and toasts are present, but no explicit ARIA live regions for result messages.

---

## Security Considerations
- **Auth guard:** Middleware protects app routes; settings page requires authenticated session.
- **Token handling:** Access token stored in localStorage + cookie; cleared on logout/401. No refresh token flow yet.
- **User data caching:** Full profile cached in localStorage (`invotick_user`); ensure PII handling aligns with policy. Clearing on logout already implemented.
- **Backend validation:** UI relies on backend to validate fields; client-side validation minimal.
- **CORS/HTTPS:** API must serve correct CORS/HTTPS (noted earlier during auth setup).

---

## Suggested Improvements (Structure & UX)
- **Avatar:** Add backend upload endpoint + signed URL or multipart; update `AvatarPicker` to POST and persist `profilePictureUrl`. Add progress/error states.
- **Password:** When backend ready, add new/confirm fields with strength meter; use `updatePassword` service; add toasts/logging.
- **Notification token:** Replace free-text with device-generated token; validate format; hide if not applicable on web.
- **Field validation:** Add phone and address format helpers; optional country/state selectors.
- **Settings IA:** Split into tabs/sections (Profile, Security, Preferences). Use routes or in-page tabs.
- **Optimistic/UI polish:** Disable save button while pending; show last-updated timestamp; inline success state.
- **Schema alignment:** Mirror backend DTO explicitly; remove/guard `profilePictureUrl` until supported to avoid 400s.
- **Accessibility:** Add `aria-live` for toast container; ensure form fields have `aria-invalid` when errors present.
- **Configurable lists:** Surface locale/currency selectors, backed by env-driven lists.

---

## Proposed Clean Architecture for Settings
- **UI Layer (App Router client components):**
  - `app/settings/page.tsx` → orchestrates tabs/sections.
  - Presentational components: `ProfileForm`, `AvatarSection`, `PasswordSection`, `PreferencesSection`.
  - Common form inputs with error + helper text.
- **Feature hooks (React Query):**
  - `useProfileQuery` (GET `/profile/me`), `useUpdateProfile`, `useUpdatePassword`, `useUploadAvatar` (future).
  - Encapsulate toasts and logging inside hooks to keep UI lean.
- **State/Persistence:**
  - Redux slice `auth` owns `user`; `userStorage` hydrates on load; updates only via service successes.
  - Avoid duplicating user state in multiple stores; single source of truth.
- **Services:**
  - `profile.ts`: strict DTO types; avatar upload separated (`uploadAvatar(file): { url }`).
  - Validation/parsing layer to map backend errors to field errors.
- **Design System:**
  - Reuse `NameAvatar`, `AvatarPicker`, form controls; add `Toast` and `Modal` already present.
  - Add reusable `SettingsCard` pattern for consistency.
- **Security:**
  - Guard routes in middleware (already active).
  - Handle token refresh (if adopted) before failing requests; on hard 401 clear tokens/user.
  - Minimize PII in localStorage (consider encrypted storage or cookie-only if feasible).
- **Extensibility:**
  - Preferences (locale/currency/theme) stored in Redux + persisted; read from env-driven lists.
  - Modular sections so future settings can be added without touching existing flows.

---

## File Map (Key References)
- `src/app/settings/page.tsx` — main settings UI (profile form, avatar preview, password placeholder).
- `src/services/profile.ts` — profile API calls.
- `src/types/dto/profile.ts` — profile shapes.
- `src/components/profile/AvatarPicker.tsx` — avatar selection + preview (no upload).
- `src/components/ui/name-avatar.tsx` — generated initials avatar.
- `src/components/layout/sidebar-nav.tsx` — shows user avatar/name/email from Redux.
- `src/store/slices/authSlice.ts` — auth/user state.
- `src/services/auth/userStorage.ts` — localStorage persistence for user.
- `src/services/auth/tokenStorage.ts` — token storage/cookies.
- `src/services/api.ts` — Axios client with auth + 401 handling.
- `src/app/providers.tsx` — hydration of tokens/user and profile fetch on mount.

---

## Quick Start for Contributors
1) Ensure `.env.local` has `NEXT_PUBLIC_API_BASE_URL` and token cookie names; run `npm run dev`.
2) Log in; navigate to `/settings`; edit profile fields; click “Save profile.”
3) Avatar selection will only preview and warn (not persisted).
4) Password section is disabled until backend support is added.
5) To extend settings, add a new section component and wire to services/hooks per proposed architecture.
