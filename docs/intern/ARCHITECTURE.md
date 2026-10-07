# System Architecture Overview

## High-Level Structure
- Framework: Next.js 16 App Router. Server route handlers live under `src/app/api/**/route.ts`. Pages live under `src/app`, and shared UI under `src/components`.
- Storage: SQLite through Prisma 6. The data model is `prisma/schema.prisma`. `npm run dev` and `npm start` first run `scripts/prepare-db.mjs`, which does `prisma db push` with `DATABASE_URL` defaulting to `file:./dev.db`.
- Client cache: one React Query client (`src/components/providers/app-providers.tsx:10-21`) with `staleTime` 30 s and `gcTime` 10 min. The cache lives only in memory.
- Offline writes: Dexie (IndexedDB) queues mutations (`src/lib/offline/queue-db.ts`), and they are replayed through `POST /api/sync`.
- PWA: `public/sw.js` serves cached pages first and never caches `/api/` requests (`sw.js:35-37`).

## Core Data Domains
- Identity and session: `User`, `Session`, `UserSettings`.
- Planning hierarchy: `Area` → `Project` → `Task`.
- Daily execution: `DayPlan`, `DayTask`, `ScheduleBlock`, `TimeEntry`. Every one of these stores its day as a `"YYYY-MM-DD"` string.
- Tracking goals: `Goal` + `DashboardWidget`. Templates live in the `Template` model.

## Request and Mutation Flow
- Reads: pages call `apiFetch` through React Query. `TodayClient` (`src/components/today/today-client.tsx`) is the main orchestrator.
- Writes on the Today page (adding a checklist item, toggling, planned-time increments, schedule blocks, manual time entries) go through `useOfflineMutation` (`src/hooks/use-offline-mutation.ts`).
  - Online, meaning `navigator.onLine` is true: the write goes straight to the REST route.
  - Offline: the payload is queued in IndexedDB under a `mutationType` such as `daytask.update`.
  - On reconnect: `useOfflineSync` (mounted once in `AppShell`) posts the queue to `POST /api/sync`.
  - The server replays each mutation in `src/lib/sync.ts`. Updates, deletes, and `daytask.create` apply last-write-wins against `updatedAt`. `schedule.create` and `time.create` are plain inserts.
- Not queued: timer start and stop (`today-client.tsx:140, 154`) and every write on Plan, Goals, and Settings, which call `apiFetch` directly. Those fail while offline.

## Auth and User Resolution
- Auth helpers live in `src/lib/auth.ts`. Routes call `withUser()` from `src/lib/api.ts`.
- `requireUser` (`auth.ts:81-123`) returns the session user. Without a session, it returns the oldest user in the database, or creates a `local-user-*` account on a fresh database. Because of this, `withUser` never returns its 401 in practice, and logging out does not change who you are.

## Today Page Composition
- Container: `src/components/today/today-client.tsx`.
- Checklist row: `TaskRow`. Schedule row: `ScheduleBlockRow`.
- Offline visibility: `OfflineBanner`, rendered by `AppShell`.
- Timer actions call `POST /api/time-entries`, which delegates to `src/lib/timer.ts`. Starting a timer stops every running entry inside one transaction (`timer.ts:17-45`).

## API Contract and Validation
- REST request bodies are validated with zod schemas from `src/lib/schemas.ts`. Some rules live in the routes instead, such as the schedule 30-minute grid and the end-after-start checks.
- `POST /api/sync` validates only the envelope. Each mutation's `payload` is `z.record(z.string(), z.unknown())` (`schemas.ts:128`).
- Errors are formatted by `handleError` (`src/lib/api.ts:13-29`): zod errors become 400 with `issues`, and every other `Error` becomes 400 with its message.
- Aggregation endpoints:
  - `GET /api/day` returns the day plan, checklist, schedule, time entries, running timer, and totals.
  - `GET /api/goals` returns goals and widgets plus computed planned and actual minutes for each goal.
  - `POST /api/sync` returns `{ applied, failed }` mutation IDs.

## Performance and Integrity Notes
- Main read paths are indexed in the Prisma schema. Examples: `DayTask @@index([userId, date])`, `ScheduleBlock @@index([userId, date, startMin])`, `TimeEntry @@index([userId, date])`.
- `GET /api/day` runs its five reads with `Promise.all` (`day/route.ts:12`). `GET /api/goals` runs two queries per goal (`goals/route.ts:38-70`).
- Timer start (`timer.ts:17`) and each replayed sync mutation (`sync.ts:178`) run in a transaction. Goal create plus widget create (`goals/route.ts:111-135`) does not.
- Invariants enforced only in code, with no database constraint:
  - Schedule blocks don't overlap (route-level `hasOverlap`, skipped by sync).
  - Only one timer runs at a time (`timer.ts`).
  - A goal's match IDs exist.

## Known Gaps To Study
Each walkthrough has the line-level details.
- Last-write-wins losers are reported as `applied` (`sync.ts:54-56`). Failed mutations are retried forever (`use-offline-sync.ts:37-40`).
- An offline schedule extension loses `extendByMin` (`sync.ts:109-118`).
- An offline `time.update` without `endTs` reopens the entry (`sync.ts:153`).
- Manual time inputs are stored as UTC (`today-client.tsx:240-241`), and server-side date keys use the server's local timezone (`src/lib/dates.ts:3-5`).
