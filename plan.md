# Phase Execution Checklist (Reusable for any single phase)

Use this as the repeatable recipe to finish one phase end-to-end. Flow: fill a phase-specific doc using this template, lock decisions, implement, test, then write a close-out summary.

---

## 1) Phase ko samjho
- Scope: entities, fields, flows, UX expectations.
- Success criteria (acceptance checklist): API CRUD works with live backend; validation blocks bad input; list refetch after mutations; single toasts; guarded routes.

## 2) KMP app ko samjho
- Field set, validation, UX patterns (drawers, filters), offline/sync assumptions, ID handling.
- Note KMP-only fields/behaviors not in backend.

## 3) Backend ko samjho
- Controllers/DTOs/response envelopes; required/optional fields; validation messages.
- Update semantics (in-place vs new-id); soft-delete; uploads; filters/query params; pagination/sorting; error shapes.
- List unsupported fields vs KMP.

## 4) Contradictions map (use a table)
- Columns: Field/Behavior | KMP | Backend | Web decision/degradation.

## 5) Web objectives
- Implement backend-supported fields only; online-only.
- UX: list + search/filter, create/edit drawer, delete confirm, toasts, loading, refetch on mutation.
- Validation: UUID/email/phone/numeric/required as applicable.

## 6) How to implement (high level)
- DTOs + schemas.
- Services/hooks with React Query keys + invalidation.
- Components/pages; state for any selection; uploads (implement or stub/URL).
- Navigation entry for the phase.

## 7) Phase doc (deliverable before coding)
- Backend contract, KMP behaviors, contradictions table, web plan (routes/components/forms/validation/mutations), gaps/risks, acceptance criteria, test checklist, decision log (timestamps when answers locked).

## 8) Execute & Test
- Run manual test matrix: Create/Update/Delete, validation blocks, filters, upload (if any), refetch, 401, toasts single-fire.

## 9) Close-out doc (after user sign-off)
- What was built, key decisions, contradictions resolved/deferred, remaining gaps, follow-ups needed.
