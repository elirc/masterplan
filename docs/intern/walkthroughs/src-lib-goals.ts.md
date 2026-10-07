# Walkthrough: `src/lib/goals.ts`

## Why This File Matters
This file holds the pure functions that decide whether a time entry or day task counts toward a goal, and that add up planned and actual minutes. It has no runtime imports, only `import type`, so you can run it in plain Node without installing anything.

## Key Dependencies
- `import type { Goal, TimeEntry, DayTask } from "@prisma/client";`

## Key Lines
- **L4** `if (!targets.length) return false;`: an empty match list never matches.
- **L14** `if (goal.matchType === "TAG") return includesAny(data.tags, goalTags);`: the `TAG`, `PROJECT`, and `TASK` types (L14-16) each use exactly one list.
- **L18** `return (`: a `CUSTOM` goal is an OR across all three lists.
- **L33** `if (!matches || !entry.endTs) return sum;`: running timers contribute nothing to actual minutes until they are stopped.
- **L34** `Math.max(0, Math.round(`: negative durations are clamped to 0. This can happen when rounding moves `endTs` before `startTs` (see `src/lib/timer.ts`).

## Intern Check
- Goal: confirm that a running entry does not count toward a goal.
- **Check:** from the repo root, run `node --experimental-strip-types --no-warnings --input-type=module -e "const g=await import('./src/lib/goals.ts');const goal={matchType:'TAG',matchTagNames:['fitness'],matchProjectIds:[],matchTaskIds:[]};console.log(g.matchGoal(goal,{taskId:null,projectId:null,tags:['fitness']}),g.computeGoalActual(goal,[{taskId:'t',startTs:new Date('2026-01-01T09:00Z'),endTs:null,task:{projectId:'p',tags:['fitness']}}]))"` (Node 22.6+). It prints `true 0`.
