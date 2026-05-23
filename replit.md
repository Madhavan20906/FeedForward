# Food Connect Hub

AI-powered food redistribution platform connecting donors, NGOs, and sponsors to reduce food waste.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/food-redistribution run dev` — run the Expo mobile app (port 23713)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (SDK 54) + Expo Router, React Native 0.81
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/food-redistribution/` — Expo mobile app (main product)
  - `app/` — Expo Router screens (donor, ngo, admin, sponsor flows)
  - `context/AppContext.tsx` — global app state
  - `data/mockData.ts` — mock data for the app
  - `constants/colors.ts` — design tokens
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — Drizzle DB schema

## Architecture decisions

- Expo Router for file-based mobile navigation — donor/ngo/admin/sponsor flows are separate route groups
- AsyncStorage for local persistence (no DB required for first build)
- Mock data in `data/mockData.ts` drives the initial UI without requiring a live backend
- react-native-maps pinned to 1.18.0 (only Expo Go compatible version)

## Product

Multi-role food redistribution platform with:
- **Donor** flow: donate food, track deliveries, view analytics, donor matching
- **NGO** flow: request food, manage pickups, analytics dashboard
- **Admin** flow: platform management dashboard
- **Sponsor** flow: sponsorship dashboard

## User preferences

- Imported from Food-Connect-Hub ZIP project

## Gotchas

- react-native-maps must stay at version 1.18.0 — other versions crash in Expo Go
- Do NOT add react-native-maps to plugins in app.json
- Expo workflow reads PORT from environment — never hardcode port numbers
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Expo skill: `.local/skills/expo/SKILL.md`
