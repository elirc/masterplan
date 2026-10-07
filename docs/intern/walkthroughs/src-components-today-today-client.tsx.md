# Walkthrough: `src/components/today/today-client.tsx`

## Why This File Matters
`TodayClient` (575 lines) runs the main page. It holds the four queries, every write on the Today page, the optimistic cache updates, and the manual-entry modal. Most user-visible bugs end up being traced through this file.

## Key Dependencies
- `import { useQuery, useQueryClient } from "@tanstack/react-query";`
- `import { apiFetch, parseError } from "@/lib/api-client";`
- `import { buildTimeOptions, todayKey } from "@/lib/dates";`
- `import { useOfflineMutation } from "@/hooks/use-offline-mutation";`

## Key Lines
- **L50** `const offlineMutation = useOfflineMutation(meQuery.data?.id ?? "");`: until `/api/me` loads, the user ID is an empty string. A write queued in that window carries `userId: ""`. `getPendingMutations` reads the queue by real user ID (`src/lib/offline/queue-db.ts:31`), so that write is never synced.
- **L52** `const dayQuery = useQuery({`: the query key is `["day", date]`. The goals and task-catalog queries follow at L57 and L62.
- **L81** `function optimisticDay(`: patches the cached `DayData` directly. Used for the complete toggle (L125-130) and the planned-time increments (L177-183).
- **L97** `await offlineMutation.mutateWithQueue`: the add-task write. Each queued write names a `mutationType` that must match a `case` in `src/lib/sync.ts`.
- **L140** `const data = await apiFetch<{ entry: TimeEntryItem }>("/api/time-entries", {`: start and stop (L154) call the API directly and are not queued offline.
- **L197** `await offlineMutation.mutateWithQueue<{ block: ScheduleBlockItem }>({`: extends the selected block with `extendByMin` (L204). The offline replay of `schedule.update` (`src/lib/sync.ts:109-118`) ignores `extendByMin`, so an extension made offline only relinks the task.
- **L240** `` const startTs = `${date}T${manualStart}:00.000Z`; ``: the `HH:MM` the user enters is stored as UTC. `editEntry` reads it back with `substring(11, 16)` (L231), so the round trip agrees with itself. Outside UTC, however, the times are off by the local offset.

## Intern Check
- Goal: stop queuing writes before `meQuery` has loaded, for example by disabling the actions while `meQuery.data` is undefined.
- **Check:** after your change, no code path calls `mutateWithQueue` with an empty `userId`. Trace L50 and every call site listed by `grep -n "mutateWithQueue" src/components/today/today-client.tsx`.
