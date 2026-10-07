# Walkthrough: `src/app/page.tsx`

## Why This File Matters
`/` is the splash screen. It shows the three slogans, counts down, and then sends the user on to `/home`, which redirects to `/today` (`src/app/home/page.tsx:4`).

## Key Dependencies
- `import { useEffect, useState } from "react";`
- `import { Nosifer } from "next/font/google";`
- `import { useRouter } from "next/navigation";`

## Key Lines
- **L12** `const COUNTDOWN_SECONDS = 5;`: one constant drives both the label and the redirect delay.
- **L19** `window.setTimeout(() => {`: does the redirect with `router.replace` (L20), so the Back button does not return to the splash.
- **L23** `window.setInterval(() => {`: updates the visible countdown once per second.
- **L27** `return () => {`: the cleanup clears both timers, which prevents a redirect after the component unmounts.

## Intern Check
- Goal: add a "Skip" button that redirects immediately, without leaving the timers running.
- **Check:** your button calls `router.replace("/home")`, and the existing cleanup at L27-30 still clears both timers on unmount.
