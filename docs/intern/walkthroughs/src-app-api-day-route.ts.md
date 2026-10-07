# Walkthrough: `src/app/api/day/route.ts`

## Why This File Matters
`GET /api/day` is the aggregate read behind the Today page. In one response it returns the day plan, the checklist, schedule blocks, time entries, the running timer, and planned and actual totals.

## Key Dependencies
- `import { withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`
- `import { todayKey } from "@/lib/dates";`

## Key Lines
- **L10** `const date = request.nextUrl.searchParams.get("date") ?? todayKey();`: the query string is used without validation. Write routes use `dateSchema` (`src/lib/schemas.ts:3`), but this read does not. When the parameter is missing, the date falls back to the server's local day.
- **L12** `Promise.all([`: five independent reads run in parallel.
- **L47** `prisma.timeEntry.findFirst({`: the running entry is looked up without a `date` filter (L48), so a timer started yesterday still appears today.
- **L56** `if (!entry.taskId || !entry.endTs) continue;`: open entries count as 0 actual minutes until they are stopped. Entries with no task are left out of the per-task totals.
- **L57** `Math.round(`: minutes are rounded per entry, then summed.
- **L80** `return Response.json({`: this is the `DayData` shape that `today-client.tsx` reads and patches optimistically.

## Intern Check
- Goal: validate `date` with `dateSchema` and return 400 for a bad value.
- **Check:** `grep -n "dateSchema" src/app/api/day/route.ts` prints nothing today, and prints the import plus the parse after your change.
