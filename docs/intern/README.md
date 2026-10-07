# Intern Docs Index

These docs walk through 27 of the repository's 90 tracked non-doc files: the ones that carry the data model, the API, the Today page, and offline sync. Start with [`ARCHITECTURE.md`](ARCHITECTURE.md). Then read the walkthroughs in the order below, which follows how a request actually moves through the app. Each walkthrough explains a handful of lines, by line number, and ends with one intern check.

Nothing in these docs requires `npm install`. Most checks are `grep` commands or a short trace on paper. One (`src/lib/goals.ts`) runs in plain Node 22.6+ with `--experimental-strip-types`. The real test suite, `npm test` (which runs `tsx --test tests/timer.test.ts`), needs dependencies installed, because it resolves the `@/` path alias and `date-fns`.

## Reading Order

### 1. Data model
- `prisma/schema.prisma` -> [walkthrough](walkthroughs/prisma-schema.prisma.md)
- `prisma/seed.ts` -> [walkthrough](walkthroughs/prisma-seed.ts.md)
- `src/lib/prisma.ts` -> [walkthrough](walkthroughs/src-lib-prisma.ts.md)

### 2. Request boundary (auth, validation, errors)
- `src/lib/auth.ts` -> [walkthrough](walkthroughs/src-lib-auth.ts.md)
- `src/lib/api.ts` -> [walkthrough](walkthroughs/src-lib-api.ts.md)
- `src/lib/schemas.ts` -> [walkthrough](walkthroughs/src-lib-schemas.ts.md)

### 3. Today page reads and writes
- `src/app/api/day/route.ts` -> [walkthrough](walkthroughs/src-app-api-day-route.ts.md)
- `src/app/api/daytask/route.ts` -> [walkthrough](walkthroughs/src-app-api-daytask-route.ts.md)
- `src/app/api/schedule-blocks/route.ts` -> [walkthrough](walkthroughs/src-app-api-schedule-blocks-route.ts.md)
- `src/app/api/time-entries/route.ts` -> [walkthrough](walkthroughs/src-app-api-time-entries-route.ts.md)
- `src/lib/timer.ts` -> [walkthrough](walkthroughs/src-lib-timer.ts.md)
- `src/app/api/goals/route.ts` -> [walkthrough](walkthroughs/src-app-api-goals-route.ts.md)
- `src/lib/goals.ts` -> [walkthrough](walkthroughs/src-lib-goals.ts.md)

### 4. Offline path
- `src/hooks/use-offline-mutation.ts` -> [walkthrough](walkthroughs/src-hooks-use-offline-mutation.ts.md)
- `src/lib/offline/queue-db.ts` -> [walkthrough](walkthroughs/src-lib-offline-queue-db.ts.md)
- `src/hooks/use-offline-sync.ts` -> [walkthrough](walkthroughs/src-hooks-use-offline-sync.ts.md)
- `src/app/api/sync/route.ts` -> [walkthrough](walkthroughs/src-app-api-sync-route.ts.md)
- `src/lib/sync.ts` -> [walkthrough](walkthroughs/src-lib-sync.ts.md)

### 5. UI shell and components
- `src/app/layout.tsx` -> [walkthrough](walkthroughs/src-app-layout.tsx.md)
- `src/app/page.tsx` -> [walkthrough](walkthroughs/src-app-page.tsx.md)
- `src/app/(app)/layout.tsx` -> [walkthrough](walkthroughs/src-app-app-layout.tsx.md)
- `src/components/providers/app-providers.tsx` -> [walkthrough](walkthroughs/src-components-providers-app-providers.tsx.md)
- `src/components/app-shell.tsx` -> [walkthrough](walkthroughs/src-components-app-shell.tsx.md)
- `src/components/ui/offline-banner.tsx` -> [walkthrough](walkthroughs/src-components-ui-offline-banner.tsx.md)
- `src/components/today/today-client.tsx` -> [walkthrough](walkthroughs/src-components-today-today-client.tsx.md)
- `src/components/today/task-row.tsx` -> [walkthrough](walkthroughs/src-components-today-task-row.tsx.md)
- `src/components/today/schedule-block-row.tsx` -> [walkthrough](walkthroughs/src-components-today-schedule-block-row.tsx.md)

## Capstone Exercises
Each exercise crosses several files. Do them after the reading order.

1. **Trace one offline write end to end.**
   Goal: follow "+30m while offline" from `today-client.tsx:167` through `use-offline-mutation.ts:19-28`, `queue-db.ts:27`, `use-offline-sync.ts:32`, `sync/route.ts:12`, and `sync.ts:68-82`.
   **Check:** your trace lists the payload fields at each hop, and it notes that the schedule extension half (`extendByMin`) is dropped at `sync.ts:109-118`.

2. **Make the two write paths agree.**
   Goal: list every rule the REST routes enforce that the `sync.ts` replay skips: overlap, the 30-minute grid, `end > start`, and zod field validation.
   **Check:** `grep -n "hasOverlap\|% 30\|parse(" src/lib/sync.ts` prints nothing today. Each rule on your list points at the route line that enforces it.

3. **Decide the auth model.**
   Goal: write a short design note on whether `requireUser`'s "oldest user" fallback (`auth.ts:87-104`) should stay, and what has to change, including the logout button, before the app is deployed anywhere shared.
   **Check:** the note cites `auth.ts:87`, `api.ts:7-9` (an unreachable 401), and `app-shell.tsx:53`.

4. **Pin the timezone story.**
   Goal: list every place where a day key or timestamp is created, and say whether each one uses UTC or the local timezone: `dates.ts:3-5` (`todayKey`), `today-client.tsx:240-241`, `time-entries/route.ts:52`, and `goals/route.ts:12-15`.
   **Check:** your table has one row per site and states which side of midnight a 23:30 local entry lands on.
