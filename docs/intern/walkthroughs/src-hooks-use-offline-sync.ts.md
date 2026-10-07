# Walkthrough: `src/hooks/use-offline-sync.ts`

## Why This File Matters
This hook keeps the offline state and the pending count up to date. When the app reconnects, it sends the whole IndexedDB queue to `POST /api/sync`. `AppShell` mounts it once (`src/components/app-shell.tsx:25`).

## Key Dependencies
- `import { useCallback, useEffect, useMemo, useState } from "react";`
- `import { useQueryClient } from "@tanstack/react-query";`
- `import { apiFetch } from "@/lib/api-client";`
- `import { getPendingMutations, pendingCount, removeMutations } from "@/lib/offline/queue-db";`

## Key Lines
- **L21** `if (!userId || !navigator.onLine || syncing) return;`: guards against overlapping syncs.
- **L32** `const result = await apiFetch`: the whole queue goes in one request.
- **L37** `if (result.applied.length) {`: only `applied` IDs are removed (L38). Failed mutations stay queued and are retried on every later sync, with no cap and no backoff.
- **L41** `} catch {`: network errors keep the queue as it is.
- **L47** `}, [queryClient, refreshCount, syncing, userId]);`: `runSync` depends on `syncing`, so it gets a new identity after every sync. The effect at L49-66 depends on `runSync`, so it re-runs and calls `updateOnlineState()` (L58), which starts another sync. While any mutation keeps failing, this can loop back to back.

## Intern Check
- Goal: break the re-trigger loop. Keep `syncing` in a ref so it is not a dependency of `runSync`, and drop mutations that have failed N times.
- **Check:** after your change, `syncing` no longer appears in the `useCallback` dependency array on L47.
