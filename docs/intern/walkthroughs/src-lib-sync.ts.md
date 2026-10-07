# Walkthrough: `src/lib/sync.ts`

## Why This File Matters
`replaySyncMutations` applies the offline queue on the server. It is the riskiest file in the repo. It sits next to the REST routes as a second write path, and it skips their validation.

## Key Dependencies
- `import { Prisma } from "@prisma/client";`
- `import { prisma } from "@/lib/prisma";`

## Key Lines
- **L13** `const value = typeof payload.updatedAt === "string" ? payload.updatedAt : fallbackIso;`: the client never sends `updatedAt`, so the incoming time is always the queue time (`mutation.createdAt`).
- **L19** `function shouldApplyLww(`: last write wins. The incoming change applies when the row was last updated at or before the incoming time. An unparseable time always applies (L20).
- **L54** `if (!shouldApplyLww(existing.updatedAt, incomingAt)) {`: a write that loses last-write-wins returns normally, and `replaySyncMutations` reports it as `applied` (L181). The user's change disappears with no signal.
- **L90** `case "schedule.create": {`: no overlap check, no 30-minute check, and no `end > start` check. Compare `src/app/api/schedule-blocks/route.ts:26-36`.
- **L109** `await tx.scheduleBlock.update({`: reads `startMin`, `endMin`, `taskId`, `label`, and `locked`, but not `extendByMin`, the field the Today page sends (`today-client.tsx:204`).
- **L128** `case "time.create": {`: there is no idempotency key. If the response is lost and the queue is sent again, the same entry is created twice. `schedule.create` (L90) has the same gap.
- **L153** `endTs: payload.endTs ? new Date(payload.endTs as string) : null,`: when `endTs` is missing, the entry is set back to running.
- **L178** `await prisma.$transaction(async (tx) => {`: each mutation gets its own transaction, applied in order. One failure does not roll back the others.

## Intern Check
- Goal: fix L153 so that a missing `endTs` leaves the stored value unchanged, the same way the other optional fields use `undefined`.
- **Check:** after your change, L153 reads `payload.endTs === undefined ? undefined : ...`, or equivalent, and an explicit `null` still clears the end time.
