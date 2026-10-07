# Walkthrough: `prisma/seed.ts`

## Why This File Matters
The seed creates one example chain: area, project, task, goal, and dashboard widget. With it, the Today, Goals, and Plan pages show something on first run. It is written to be re-runnable.

## Key Dependencies
- `import bcrypt from "bcrypt";`
- `import { PrismaClient } from "@prisma/client";`

## Key Lines
- **L7** `let user = await prisma.user.findFirst();`: the seed attaches data to whichever user already exists. If no user exists yet, it creates `sample` with password `sample1234` (L10-15). The app never asks for that password, because `requireUser` falls back to the oldest user (`src/lib/auth.ts:87-104`).
- **L27** `prisma.area.upsert`: all five writes are `upsert` calls keyed on deterministic IDs such as `` `seed-area-${user.id}` `` (L29). Running the seed twice updates the rows instead of duplicating them.
- **L89** `matchType: "TAG"`: the seeded goal matches on the `fitness` tag. The `matchProjectIds` and `matchTaskIds` set on create (L101-102) are ignored for `TAG` goals (`src/lib/goals.ts:14`).
- **L131** `main()`: errors exit with code 1, and the client always disconnects in `finally`.

## Intern Check
- Goal: explain what happens to the goal's `scope` when the seed runs a second time.
- **Check:** `grep -n "scope" prisma/seed.ts` shows `scope` only in the `create` branch (L97), so a re-run never resets it. `grep -c "upsert" prisma/seed.ts` prints `5`.
