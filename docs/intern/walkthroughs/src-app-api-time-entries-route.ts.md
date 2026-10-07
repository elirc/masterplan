# Walkthrough: `src/app/api/time-entries/route.ts`

## Why This File Matters
One POST endpoint handles three actions, `start`, `stop`, and `manual`, chosen by `body.action`. The timer invariants live in `src/lib/timer.ts`, and this route only dispatches to them.

## Key Dependencies
- `import { timeEntryCreateSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`
- `import { startTimerForUser, stopTimerForUser } from "@/lib/timer";`
- `import { todayKey } from "@/lib/dates";`

## Key Lines
- **L15** `if (body.action === "start") {`: delegates to `startTimerForUser`, which stops any running entry and opens a new one inside a single transaction.
- **L25** `if (body.action === "stop") {`: stops the given `entryId`, or the latest running entry. Returns 404 when nothing is running (L31-33).
- **L38** `if (!body.startTs || !body.endTs) {`: a manual entry needs both timestamps, and the end must come after the start (L45).
- **L52** `date: body.date ?? todayKey(start),`: without an explicit `date`, the day is taken from `start` in the server's local timezone.
- **L54** `source: "MANUAL",`: manual entries are tagged so they can be told apart from timer entries.

## Watch Out
The client calls `start` and `stop` with plain `apiFetch` (`src/components/today/today-client.tsx:140, 154`), not through `useOfflineMutation`. While offline, the timer buttons fail with a toast instead of being queued.

## Intern Check
- Goal: write down what should happen offline when the user presses Start, and which `sync.ts` mutation type would have to exist to support it.
- **Check:** `grep -n "time.start\|time.stop" src/lib/sync.ts` prints nothing today.
