# Walkthrough: `src/lib/prisma.ts`

## Why This File Matters
Every server-side database call goes through the one `prisma` instance exported here.

## Key Dependencies
- `import { PrismaClient } from "@prisma/client";`

## Key Lines
- **L3** `const globalForPrisma = globalThis as unknown as {`: the client is stored on `globalThis` so that Next.js hot reload in development reuses it instead of opening a new client on every reload.
- **L10** `log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],`: warnings are logged only in development.
- **L13** `if (process.env.NODE_ENV !== "production") {`: the instance is cached globally outside production. In production, each module instance creates its own client once.

## Intern Check
- Goal: explain what would go wrong in development without L13-15.
- **Check:** your answer mentions that each hot reload would create a new `PrismaClient`, so connections and memory grow until the server restarts.
