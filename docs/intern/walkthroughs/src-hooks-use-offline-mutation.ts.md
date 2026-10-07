# Walkthrough: `src/hooks/use-offline-mutation.ts`

## Why This File Matters
`mutateWithQueue` is the single write path for queue-able actions. When the browser is online it calls the REST endpoint. When it is offline it stores the mutation in IndexedDB for `/api/sync` to replay later.

## Key Dependencies
- `import { useQueryClient } from "@tanstack/react-query";`
- `import { enqueueMutation, type OfflineMutation } from "@/lib/offline/queue-db";`

## Key Lines
- **L17** `options.applyOptimistic?.();`: the optimistic update runs before the network call. Nothing here rolls it back. On error, callers invalidate the query instead (for example `today-client.tsx:134`).
- **L19** `if (!navigator.onLine) {`: the browser's online flag is the only test. If `navigator.onLine` is true but the request fails, for example on a captive portal or with a server that is down, the `fetch` at L31 throws and the write is lost, not queued.
- **L24** `payload: options.payload,`: the same payload is sent to the REST route when online and replayed by `sync.ts` when offline. Both sides must accept exactly the same field names.
- **L44** `await queryClient.invalidateQueries();`: invalidates every query after each successful write. That is simple to reason about, but it refetches more than it needs to.

## Intern Check
- Goal: queue the mutation when `fetch` throws a network error (a `TypeError`), and not only when `navigator.onLine` is false.
- **Check:** after your change, the `fetch` at L31 sits inside a `try` whose `catch` calls `enqueueMutation`. HTTP error responses (`!res.ok`) must still throw.
