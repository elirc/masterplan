# Walkthrough: `src/app/api/daytask/route.ts`

## Why This File Matters
`POST /api/daytask` adds a planning task to a day's checklist. This is the online path. The offline path is the `daytask.create` case in `src/lib/sync.ts:29-67`.

## Key Dependencies
- `import { dayTaskCreateSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`

## Key Lines
- **L11** `dayTaskCreateSchema.parse`: validates the date format, `taskId`, and the optional numbers.
- **L13** `prisma.dayTask.findUnique({`: looks the row up through the `userId_date_taskId` unique key (`prisma/schema.prisma:190`).
- **L23** `if (existing) {`: a repeated add returns the existing row with status 200 instead of failing. That makes this endpoint idempotent from the client's point of view.
- **L27** `prisma.dayTask.findFirst({`: finds the current highest `sortOrder` so the new row is appended (L39).
- **L38** `plannedMin: body.plannedMin ?? 30,`: the default estimate is 30 minutes. The client normally sends the task's `defaultEstimateMin`.

## Watch Out
The code checks first and creates second. If two requests arrive at the same moment, both can pass L23. The second `create` then hits the unique constraint, and `handleError` turns that Prisma error into a 400 that carries Prisma's message (`src/lib/api.ts:24-26`).

## Intern Check
- Goal: make the concurrent case return the existing row, either by catching the unique-constraint error or by using `upsert`.
- **Check:** `grep -n "upsert\|P2002" src/app/api/daytask/route.ts` prints nothing today.
