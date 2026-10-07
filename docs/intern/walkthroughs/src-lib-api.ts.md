# Walkthrough: `src/lib/api.ts`

## Why This File Matters
Every route handler starts with `withUser()` and catches errors with `handleError()`. These two helpers decide how the API authenticates requests and how it reports errors.

## Key Dependencies
- `import { ZodError } from "zod";`
- `import { requireUser } from "@/lib/auth";`
- `import { json } from "@/lib/utils";`

## Key Lines
- **L6** `const user = await requireUser();`: `requireUser` always returns a user. It falls back to the oldest user or creates a local one (`src/lib/auth.ts:81-123`). That makes the 401 branch at L7-9 unreachable in practice.
- **L14** `if (error instanceof ZodError) {`: validation failures return 400 with the zod `issues`.
- **L24** `if (error instanceof Error) {`: every other `Error` also becomes a 400 with its raw `message`, including Prisma errors such as unique-constraint violations. Server faults look like client errors, and internal details reach the client.

## Intern Check
- Goal: give known domain errors their own status codes, and return a generic 500 for anything unexpected.
- **Check:** after your change, `handleError` no longer copies `error.message` into the response for unknown error types.
