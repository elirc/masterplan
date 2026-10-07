# Walkthrough: `src/lib/schemas.ts`

## Why This File Matters
All request bodies are validated with these zod schemas. Read them to see exactly which fields each API accepts. Some rules that look like they belong here are actually enforced in the routes instead.

## Key Dependencies
- `import { z } from "zod";`

## Key Lines
- **L3** `export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);`: checks the shape only, so `2026-13-45` passes.
- **L66** `startMin: z.number().int().min(0).max(1440),`: there is no 30-minute rule and no `end > start` rule here. Both are checked in the schedule-block routes.
- **L79** `extendByMin: z.number().int().positive().optional(),`: only the PATCH schema accepts `extendByMin`.
- **L96** `endTs: z.string().datetime().optional().nullable(),`: in a PATCH, `endTs: null` means "reopen". The offline replay sets `endTs` to `null` whenever the field is missing (`src/lib/sync.ts:153`).
- **L104** `timerRoundingMin: z.union([z.literal(0), z.literal(5), z.literal(15)]),`: the only rounding steps allowed.
- **L128** `payload: z.record(z.string(), z.unknown()),`: sync payloads are not validated against the per-endpoint schemas above.

## Intern Check
- Goal: validate each sync payload with the matching endpoint schema, for example `daytask.create` with `dayTaskCreateSchema`.
- **Check:** after your change, `grep -n "z.unknown()" src/lib/schemas.ts` no longer matches the sync payload line, or `src/lib/sync.ts` parses `payload` per `type`.
