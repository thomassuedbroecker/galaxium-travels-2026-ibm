# Demo Plan — Destination Pages

**Feature:** Issue #32 — Destination Detail Pages (`/destinations/:slug`)  
**Branch:** `demo/destination-pages`  
**Duration:** ~10 min

## Steps

1. **Open issue #32** — "implement this"
2. **Show the Excel file** — `destinations_content.xlsx` — *"content team maintains this, Bob can't read it natively"*
3. **Create a skill** — *"create a `galaxium-content` skill that knows our Excel schema"*
4. **Bob uses the new skill** — reads Excel → generates `src/data/destinations.ts`
5. **Bob implements the feature** — `DestinationDetail.tsx`, router, homepage links, flight list
6. **Parallel task (second window)** — *"explain this codebase to me"* runs while step 5 is in progress
7. **Show result** — new destination page live in browser

## Key Moments

| Moment | Capability shown |
|---|---|
| Issue → implementation | Natural issue-driven development |
| Excel → code | Skill bridging non-code assets |
| Skill creation | Bob extending its own capabilities |
| Two tasks at once | Parallel agents |
| Visual result | Rich frontend payoff |
