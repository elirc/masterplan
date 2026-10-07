# Walkthrough: `src/app/api/goals/route.ts`

## Why This File Matters
`GET /api/goals` computes planned and actual minutes for every goal and builds the dashboard widget list for Today and Goals. `POST /api/goals` creates a goal together with its widget.

## Key Dependencies
- `import { addDays, format, parseISO, startOfWeek } from "date-fns";`
- `import { goalSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`
- `import { computeGoalActual, computeGoalPlanned } from "@/lib/goals";`
- `import { todayKey } from "@/lib/dates";`

## Key Lines
- **L9** `function dateRangeForScope(`: a `DAILY` goal covers one date, and a `WEEKLY` goal covers Monday through Sunday (`weekStartsOn: 1`, L12). `parseISO` reads a UTC midnight, but `startOfWeek` and `format` work in the server's local timezone. On a server west of UTC, a Monday date can therefore resolve to the previous week.
- **L26** `Promise.all([`: goals and widgets load in parallel.
- **L38** `goals.map(async (goal) => {`: each goal runs its own two queries (L41-70). Five goals means ten extra queries, even though all daily goals read the same rows.
- **L77** `actualMin: computeGoalActual(goal, entries),`: the matching logic lives in `src/lib/goals.ts`.
- **L111** `prisma.goal.create({`: the goal and its widget (L127) are two separate writes with no transaction. If the second fails, the goal exists without a widget.
- **L125** `prisma.dashboardWidget.count`: the widget count becomes the new widget's `sortOrder`.

## Intern Check
- Goal: wrap the goal and widget writes in `prisma.$transaction`, and load entries and day tasks once per distinct date range instead of once per goal.
- **Check:** `grep -n "\$transaction" src/app/api/goals/route.ts` prints nothing today.
