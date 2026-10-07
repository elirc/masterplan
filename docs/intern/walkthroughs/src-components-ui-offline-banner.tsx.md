# Walkthrough: `src/components/ui/offline-banner.tsx`

## Why This File Matters
This banner is the only place the user sees offline state and the number of queued writes. All its state comes from `useOfflineSync` through `AppShell`.

## Key Lines
- **L14** `if (!isOffline && pending === 0) return null;`: the banner is hidden when the app is online with nothing queued.
- **L20** `{isOffline ? "Offline mode active." : "Back online."}`: a pending count above 0 while online usually means some mutations keep failing (see `src/hooks/use-offline-sync.ts:37-40`).
- **L22** `{!isOffline && pending > 0 && (`: the manual "Sync now" button appears only when online, and is disabled while a sync runs (L25).

## Intern Check
- Goal: describe what the user sees when one queued mutation fails every time.
- **Check:** your description says the banner stays on "Back online. 1 pending change." indefinitely, because failed mutations are never removed from the queue.
