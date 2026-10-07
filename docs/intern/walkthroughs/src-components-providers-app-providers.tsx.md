# Walkthrough: `src/components/providers/app-providers.tsx`

## Why This File Matters
This file creates the single React Query client. Its defaults decide how fresh every screen's data is and how long cached data survives.

## Key Dependencies
- `import { useState } from "react";`
- `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";`
- `import { ReactQueryDevtools } from "@tanstack/react-query-devtools";`
- `import { ToastProvider } from "@/hooks/use-toast";`
- `import { ToastViewport } from "@/components/ui/toast";`

## Key Lines
- **L10** `const [queryClient] = useState(`: the lazy initializer creates the client once per mount, not on every render.
- **L15** `staleTime: 30_000,`: queries count as fresh for 30 seconds. `refetchOnWindowFocus: false` (L17) means switching tabs does not refetch.
- **L16** `gcTime: 1000 * 60 * 10,`: unused cached data is dropped after 10 minutes. The cache lives only in memory, and `public/sw.js:35-37` never caches `/api/` responses. After a reload while offline, there is no data to show.
- **L29** `<ReactQueryDevtools initialIsOpen={false} />`: the devtools panel. The package renders it only in development builds.

## Intern Check
- Goal: decide whether offline reloads should show the last known data, and name the React Query feature you would use to keep the cache across reloads.
- **Check:** `grep -rn "persistQueryClient\|createSyncStoragePersister" src` prints nothing today.
