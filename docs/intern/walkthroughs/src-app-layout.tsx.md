# Walkthrough: `src/app/layout.tsx`

## Why This File Matters
This is the root layout for every route, including the splash page. It links the PWA manifest and mounts the React Query and toast providers. It also registers the service worker.

## Key Dependencies
- `import "./globals.css";`
- `import { AppProviders } from "@/components/providers/app-providers";`
- `import { PwaRegister } from "@/components/pwa-register";`

## Key Lines
- **L9** `manifest: "/manifest.webmanifest",`: points to `public/manifest.webmanifest`.
- **L16** `<AppProviders>`: the one `QueryClient` for the whole app is created here.
- **L17** `<PwaRegister />`: registers `/sw.js` on mount and ignores any failure (`src/components/pwa-register.tsx:10-16`).

## Intern Check
- Goal: open `public/sw.js` and work out what a returning user sees right after a deploy.
- **Check:** `sw.js` serves cached pages first (`public/sw.js:39-41`) under a fixed `CACHE_NAME` (`sw.js:1`). Until that name changes, a returning user keeps getting the old cached HTML.
