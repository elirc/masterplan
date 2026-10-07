# Walkthrough: `prisma/schema.prisma`

## Why This File Matters
This file is the single source of truth for every table the app stores in SQLite. It also tells you which invariants the database enforces. The ones it does not enforce, such as "no overlapping schedule blocks" or "only one running timer", live in route and lib code. Those rules can be bypassed, so learn where each one lives.

## Key Lines
- **L6** `provider = "sqlite"`: a single local file database. `scripts/prepare-db.mjs` runs `prisma db push` before `dev` and `start`, with `DATABASE_URL` defaulting to `file:./dev.db`.
- **L115** `tags`: `Task.tags` is a `Json` column, not a relation. Tag matching for goals therefore happens in JavaScript (`src/lib/goals.ts:14`), and no index can serve it.
- **L136** `matchTagNames`: `Goal.matchTagNames`, `matchProjectIds`, and `matchTaskIds` (L136-138) are also `Json` arrays. Nothing at the database level checks that the stored IDs exist.
- **L167** `date`: `DayPlan`, `DayTask`, `ScheduleBlock`, and `TimeEntry` store the day as a `"YYYY-MM-DD"` string, not a `DateTime`. Every query compares strings.
- **L190** `@@unique([userId, date, taskId])`: a task can appear only once per day. Both `POST /api/daytask` and the sync `daytask.create` case depend on this constraint.
- **L203** `locked`: schedule blocks default to locked. The schema has no constraint against overlap. The only overlap guard is `hasOverlap` in the schedule-block routes.
- **L207** `onDelete: SetNull`: deleting a task keeps its schedule blocks and time entries (L225 does the same), but unlinks them.
- **L220** `endTs`: a time entry with `endTs = null` is a running timer. The schema allows several of them. `startTimerForUser` (`src/lib/timer.ts:17-45`) is what keeps it to one.

## Intern Check
- Goal: list every invariant that lives in code rather than in this schema, then find where each one is enforced.
- **Check:** `grep -c "@@unique" prisma/schema.prisma` prints `3` (`DashboardWidget`, `DayPlan`, `DayTask`). `grep -n "hasOverlap" src/lib/sync.ts` prints nothing, which proves that a replayed `schedule.create` skips the overlap rule.
