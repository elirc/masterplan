# Walkthrough: `src/lib/auth.ts`

## Why This File Matters
This file holds password hashing, session cookies, and `requireUser`, which every route calls through `withUser`. It explains why the app works without signing in.

## Key Dependencies
- `import bcrypt from "bcrypt";`
- `import { cookies } from "next/headers";`
- `import crypto from "node:crypto";`
- `import { prisma } from "@/lib/prisma";`
- `import { SESSION_COOKIE } from "@/lib/constants";`

## Key Lines
- **L11** `return bcrypt.hash(password, 12);`: bcrypt with cost factor 12.
- **L19** `return crypto.randomBytes(32).toString("hex");`: a 256-bit random session token. It is stored in plaintext in `Session.token` (`prisma/schema.prisma:59`).
- **L39** `cookieStore.set(SESSION_COOKIE, token, {`: the cookie is `httpOnly` and `sameSite: "lax"`, and `secure` only in production (L40-42). It expires after 30 days (L7).
- **L72** `if (session.expiresAt.getTime() <= Date.now()) {`: an expired session is deleted when it is next read.
- **L87** `const existing = await prisma.user.findFirst({`: with no valid session, the request becomes the oldest user. That holds for every request with no cookie, even after other accounts have signed up.
- **L106** `const randomSuffix = crypto.randomBytes(3).toString("hex");`: on a fresh database, a `local-user-xxxxxx` account is created with a random password nobody knows (L108).
- **L125** `export async function requireUserOrRedirect() {`: this function never redirects. It simply returns `requireUser()`.

## Intern Check
- Goal: write down the threat model this design accepts. A single-user local install is fine. Any server reachable by other people gives every visitor the first user's data.
- **Check:** your write-up names L87-104 as the line range that would have to change before the app is exposed to the network.
