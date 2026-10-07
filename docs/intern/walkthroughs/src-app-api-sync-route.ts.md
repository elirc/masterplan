# Walkthrough: `src/app/api/sync/route.ts`

## Why This File Matters
`POST /api/sync` is the server end of offline mode. The client sends its queued mutations here, and the route replays them through `src/lib/sync.ts`.

## Key Dependencies
- `import { handleError, withUser } from "@/lib/api";`
- `import { syncSchema } from "@/lib/schemas";`
- `import { replaySyncMutations } from "@/lib/sync";`

## Key Lines
- **L11** `syncSchema.parse(await request.json())`: this validates only the envelope. `payload` is `z.record(z.string(), z.unknown())` (`src/lib/schemas.ts:128`), so none of the per-endpoint schemas run on replayed data.
- **L12** `body.mutations.filter((mutation) => mutation.userId === auth.user!.id)`: mutations belonging to another user ID are dropped without a word. They appear in neither `applied` nor `failed`, so the client keeps them in IndexedDB forever (`src/hooks/use-offline-sync.ts:37-40` removes only `applied`).
- **L14** `replaySyncMutations(ownedMutations)`: returns `{ applied, failed }`.

## Intern Check
- Goal: report the filtered-out mutations in `failed` with a clear reason, so the client can stop retrying them.
- **Check:** after your change, `grep -n "failed" src/app/api/sync/route.ts` shows the dropped mutations being added to the response.
