# Walkthrough: `src/components/today/task-row.tsx`

## Why This File Matters
`TaskRow` is the main control on the Today checklist: Start or Stop, the planned-time buttons, Edit, and the Done checkbox. It holds no state. Every action is a callback that `today-client.tsx` wires up (L400-408).

## Key Dependencies
- `import { cn } from "@/lib/utils";`
- `import type { DayTaskItem } from "@/types/api";`

## Key Lines
- **L38** `P {item.plannedMin}m`: shows planned minutes next to actual minutes. `actualMin` comes from `GET /api/day` and leaves out the running entry (`src/app/api/day/route.ts:56`).
- **L45** `onChange={() => onToggleComplete(item)}`: the parent applies the toggle optimistically.
- **L53** `{!running ? (`: Start and Stop swap based on the `running` prop. The parent computes it as `runningTaskId === item.taskId`.
- **L64** `onClick={onStop}`: Stop passes no `entryId`, so the server stops the latest running entry (`src/lib/timer.ts:65-71`).
- **L89** `onClick={() => onEdit(item)}`: the parent wires this to `openManualModal`, which creates a new manual time entry. It does not edit an existing one. Editing an existing entry goes through `editEntry` (`today-client.tsx:228`).

## Intern Check
- Goal: rename the "Edit" button label to match what it does, for example "Log time".
- **Check:** `grep -n "onEdit={openManualModal}" src/components/today/today-client.tsx` confirms the wiring, and your label describes creating an entry.
