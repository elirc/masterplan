# Walkthrough: `src/lib/offline/queue-db.ts`

## Why This File Matters
This is the IndexedDB (Dexie) store for writes made while offline. Each row is one `OfflineMutation`, and its shape matches what `POST /api/sync` expects (`src/lib/schemas.ts:124-130`).

## Key Dependencies
- `import Dexie, { type Table } from "dexie";`

## Key Lines
- **L17** `super("master-life-plan-db");`: the database name. Changing it orphans every queued write already in users' browsers.
- **L19** `queue: "id, userId, createdAt, type",`: `id` is the primary key, and the other three fields are indexes. Adding a new indexed field needs a `this.version(2)` migration.
- **L27** `await offlineDb.queue.put(mutation);`: `put` inserts or replaces by `id`, and each mutation gets a fresh UUID (`src/hooks/use-offline-mutation.ts:21`).
- **L31** `return offlineDb.queue.where("userId").equals(userId).sortBy("createdAt");`: mutations are replayed in the order they were created, which last-write-wins depends on.
- **L35** `await offlineDb.transaction("rw", offlineDb.queue, async () => {`: all deletes run in one transaction.

## Intern Check
- Goal: add an `attempts` counter so the sync hook can drop mutations that keep failing.
- **Check:** your change bumps the schema with `this.version(2).stores({...})`, and leaves `version(1)` in place.
