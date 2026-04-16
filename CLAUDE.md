# fashion-web

Next.js 16 + Payload CMS v3 e-commerce app for The White (Vietnamese fashion brand).

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.9
- **CMS**: Payload CMS v3 (REST + GraphQL + admin panel)
- **DB**: PostgreSQL (Cloud SQL in prod, Docker locally)
- **UI**: TailwindCSS 3.4, shadcn/ui, Radix primitives, CVA for variants
- **i18n**: next-intl v4 — sub-path routing (`/vi/...`, `/en/...`), default locale: `vi`
- **State**: React Context (Cart, User, Modal), SWR for data fetching
- **Auth**: JWT + social login (Google, Facebook)
- **Package manager**: pnpm 9.7.1 (never use npm/yarn)
- **Node**: >= 20.9.0

## Commands

```bash
pnpm dev                # Dev server (http://localhost:3200)
pnpm lint               # ESLint check
pnpm lint:fix           # ESLint autofix
pnpm format             # Prettier write
pnpm format:check       # Prettier check
npx tsc --noEmit        # Type check
pnpm generate:types     # Regenerate src/payload-types.ts
pnpm build              # Production build
```

**After any Payload collection/global schema change**, run `pnpm generate:types`.

## Code Style

- Single quotes, no semicolons, trailing commas, 100-char line width (Prettier enforced)
- `@/` path alias maps to `./src/*`
- TypeScript: `strict: false` but `strictNullChecks: true`

## Component Patterns

- **Server-first**: Default to Server Components. Only add `'use client'` when needed.
- **Client suffix**: Use `.client.tsx` for client-side counterparts (e.g., `Header/Component.client.tsx`)
- **`cn()` utility**: Always use `cn()` from `@/utilities/cn` for className merging (clsx + tailwind-merge)
- **No hardcoded colors**: Use CSS variables and Tailwind theme tokens
- **Component locations**:
  - `src/components/ui/` — shadcn/ui primitives (owned, copy-paste model)
  - `src/components/ecommerce/` — business-logic components
  - `src/blocks/` — Payload layout blocks (each has `config.ts` + `Component.tsx`)

## Payload CMS

- **Collections**: `src/collections/` — Pages, Posts, Media, Categories, Users, Products, Orders, VietnamAddresses (Provinces/Districts/Wards)
- **Globals**: Header, Footer, Homepage, PaymentMethods — in `src/globals/` and `src/Header/`, `src/Footer/`
- **Types**: Auto-generated at `src/payload-types.ts` — import from here, never hand-type Payload schemas
- **Access control**: `src/access/` — `anyone()`, `authenticated()`, `authenticatedOrPublished()`
- **Blocks**: Register new blocks in `RenderBlocks.tsx`

## i18n

- **Routing**: Sub-path (`/vi/page`, `/en/page`) via next-intl
- **Translation files**: `src/messages/en.json`, `src/messages/vi.json`
- **Server Components**: Use `getTranslations()` (preferred)
- **Client Components**: Use `useTranslations()` (only when necessary)
- **Payload fields**: Use Payload's built-in localization for DB content

## State Management

- `CartContext` — in-memory cart (not yet persisted to DB)
- `UserContext` — auth state, checks `/api/users/me`
- `ModalContext` — modal open/close
- SWR for client-side data fetching/caching

## CI/CD

- **PR**: Runs format check + lint + type check
- **Push to `main`**: Auto-bumps version via standard-version, creates `v*` tag
- **`v*` tag**: Builds Docker image, deploys to Cloud Run
- **Commit convention**: Conventional Commits (`feat:` = minor, `fix:` = patch, `BREAKING CHANGE` = major)

## Testing

No test framework is currently set up. Do not assume tests exist or generate test files unless explicitly asked.

## Local Development

```bash
docker-compose up postgres    # Start local PostgreSQL
pnpm dev                      # Start Next.js + Payload dev server
```

Demo seed user: `demo-author@payloadcms.com` / `password`
