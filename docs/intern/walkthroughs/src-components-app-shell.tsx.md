# Walkthrough: `src/components/app-shell.tsx`

## Why This File Matters
`AppShell` is the frame around every in-app page: the sidebar, the mobile bottom nav, and the offline banner. It is also the only place that mounts `useOfflineSync`, so this is where queued offline writes get replayed.

## Key Dependencies
- `import Link from "next/link";`
- `import { usePathname } from "next/navigation";`
- `import { cn } from "@/lib/utils";`
- `import { useOfflineSync } from "@/hooks/use-offline-sync";`
- `import { OfflineBanner } from "@/components/ui/offline-banner";`

## Key Lines
- **L9** `const navItems = [`: the five routes, shared by both navs (L36 and L66).
- **L25** `const offline = useOfflineSync(user.id);`: starts listening for online and offline events and retries the queue.
- **L29** `<OfflineBanner`: shows offline state and the pending count.
- **L53** `<form action="/api/auth/logout" method="post">`: logout clears the session, but `requireUser` then falls back to the oldest user (`src/lib/auth.ts:87-104`). On a single-user install, you are still signed in as the same user afterwards.

## Intern Check
- Goal: decide whether the logout button should stay while sign-in is optional, and write down why.
- **Check:** tracing `POST /api/auth/logout` → `clearSession` (`src/lib/auth.ts:50-59`) → the next `requireUser` call, your notes reach the same conclusion as L53 above.
