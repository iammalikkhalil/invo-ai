# Invotick Web (Next.js)

Next.js 14 (App Router) frontend scaffold for Invotick. Includes Tailwind CSS, React Query, React Hook Form + Zod, and theming via `next-themes`.

## Getting started

```bash
cd web
npm install
npm run dev
```

Set your API base URL in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Scripts
- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run start` – start production build
- `npm run lint` – lint with Next.js core web vitals rules
- `npm run typecheck` – TypeScript type checking