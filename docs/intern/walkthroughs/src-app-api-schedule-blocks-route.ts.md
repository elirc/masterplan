# Walkthrough: `src/app/api/schedule-blocks/route.ts`

## Why This File Matters
`POST /api/schedule-blocks` enforces the schedule rules. Blocks must have positive length, sit on a 30-minute grid, and never overlap. The PATCH handler in `[id]/route.ts` repeats the same checks, and adds `extendByMin` (`[id]/route.ts:36-38`).

## Key Dependencies
- `import { scheduleBlockCreateSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`

## Key Lines
- **L6** `async function hasOverlap(`: this helper is duplicated in `[id]/route.ts:6-18`.
- **L12** `startMin: { lt: endMin },`: together with L13 (`endMin: { gt: startMin }`), this is the standard half-open interval test. Two blocks that only touch, such as 09:00-09:30 and 09:30-10:00, do not count as overlapping.
- **L26** `if (body.endMin <= body.startMin) {`: this check and the 30-minute check (L29) live here, not in the zod schema (`src/lib/schemas.ts:64-71`).
- **L34** `if (overlap) {`: an overlap returns 409 Conflict.
- **L46** `locked: body.locked ?? true,`: new blocks are locked by default.

## Watch Out
- The overlap test is a read followed by a write, and SQLite has no constraint that backs it up. Two concurrent creates can both pass.
- The offline replay `schedule.create` (`src/lib/sync.ts:90-103`) runs none of these checks.

## Intern Check
- Goal: move `hasOverlap` and the grid checks into a shared helper, then call it from both routes and from `src/lib/sync.ts`.
- **Check:** `grep -rn "async function hasOverlap" src` prints two copies today. After your change it prints one.
