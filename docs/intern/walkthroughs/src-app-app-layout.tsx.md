# Walkthrough: `src/app/(app)/layout.tsx`

## Why This File Matters
This server layout wraps every in-app page: `/today`, `/plan`, `/goals`, `/review`, and `/settings`. It resolves the user and hands that user to the client-side `AppShell`.

## Key Dependencies
- `import { AppShell } from "@/components/app-shell";`
- `import { requireUserOrRedirect } from "@/lib/auth";`

## Key Lines
- **L5** `const user = await requireUserOrRedirect();`: despite its name, this function never redirects. It just returns `requireUser()` (`src/lib/auth.ts:125-127`), and `requireUser` falls back to the oldest user, or creates a local one, when no session cookie exists.
- **L7** `<AppShell user={{ id: user.id, username: user.username }}>`: only the ID and username cross into client components, never the password hash.

## Intern Check
- Goal: decide whether to rename `requireUserOrRedirect` or to make it really redirect to `/login` when there is no session. Write one sentence on how each choice affects the "no sign-in" feature described in the README.
- **Check:** `grep -rn "requireUserOrRedirect" src` lists every caller you would need to update.
