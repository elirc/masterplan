# Walkthrough: `src/lib/timer.ts`

## Why This File Matters
This file keeps the "one running timer" rule. Starting a timer stops every open entry inside the same transaction. The pure part of that logic, `buildStartTimerMutations`, lives in `src/lib/timer-logic.ts` and is covered by `tests/timer.test.ts`.

## Key Dependencies
- `import type { Prisma } from "@prisma/client";`
- `import { roundDate, todayKey } from "@/lib/dates";`
- `import { prisma } from "@/lib/prisma";`
- `import { buildStartTimerMutations } from "@/lib/timer-logic";`

## Key Lines
- **L13** `const settings =`: when the user has no settings row, rounding defaults to 0 (L15).
- **L17** `return prisma.$transaction(async (tx) => {`: the stop-others step and the create step commit together.
- **L23** `const mutations = buildStartTimerMutations(runningEntries, now, settings.timerRoundingMin);`: other entries are stopped at the rounded time.
- **L39** `startTs: now,`: the new entry starts at the exact time, not the rounded time. The previous entry, meanwhile, was stopped at the rounded time.
- **L55** `const rounded = roundDate(now, settings?.timerRoundingMin ?? 0);`: stopping also rounds. With 15-minute rounding, a timer started at 10:07 and stopped at 10:08 gets `endTs` 10:00, which is before its start. Readers clamp that to 0 minutes (`src/lib/goals.ts:34`, `src/app/api/day/route.ts:57`).
- **L75** `return prisma.timeEntry.update({`: stop is a single write and needs no transaction.

## Running The Existing Test
`npm test` runs `tsx --test tests/timer.test.ts`, which needs `npm install` (for `tsx` and `date-fns`) because of the `@/` path alias. Plain `node` cannot run it.

## Intern Check
- Goal: decide whether rounding should be applied to `startTs` too, or whether `endTs` should never be rounded below `startTs`. Then add a test case to `tests/timer.test.ts` for the 10:07 to 10:08 example.
- **Check:** your new test asserts that the stop time is never earlier than the start time.
