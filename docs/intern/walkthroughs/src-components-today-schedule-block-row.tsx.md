# Walkthrough: `src/components/today/schedule-block-row.tsx`

## Why This File Matters
This is a presentational row for one schedule block. Selecting a block matters for more than looks: while a block is selected, `+30m` and `+1h` on a task also extend that block (`src/components/today/today-client.tsx:187-210`).

## Key Dependencies
- `import { minutesToLabel } from "@/lib/dates";`
- `import { cn } from "@/lib/utils";`
- `import type { ScheduleBlockItem } from "@/types/api";`

## Key Lines
- **L19** `onClick={() => onSelect(block.id)}`: the parent stores the selection in `selectedBlockId`.
- **L22** `selected ?`: selection is shown only by styling. Nothing tells the user that a selected block will be extended.
- **L26** `minutesToLabel(block.startMin)`: minutes since midnight are rendered as `HH:MM`.

## Intern Check
- Goal: add a small hint, such as "+time extends this block", that appears only when `selected` is true.
- **Check:** the hint is rendered conditionally on `selected`, and the component's props stay unchanged.
