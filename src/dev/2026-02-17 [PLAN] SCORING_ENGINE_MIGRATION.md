# Scoring Engine Migration Plan

**Date:** 2026-02-17
**Goal:** Migrate hive-eye-tracker from UMOv3/v4 dual-object architecture to factory ScoringEngine exclusively, extracting visualizations into a standalone `scoringVisualizations` repository.

---

## 1. Current Status Assessment

### Architecture: Dual Match Objects

The tracker maintains two parallel match objects in `env.ts`:

- **`env.match`** (UMOv3) — Primary UI driver
- **`env.matchUp`** (UMOv4 adapter wrapping factory scoring functions) — Shadow/stats

### What UMOv3 (`env.match`) Drives

| Responsibility        | Files                                       | Methods Used                                                                                                                             |
| --------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Score display**     | `displayUpdate.ts:8`                        | `score()` → counters, points string, set components                                                                                      |
| **Scoreboard**        | `env.ts:179,218`                            | `scoreboard()`                                                                                                                           |
| **Server tracking**   | `displayUpdate.ts:160,201`                  | `nextTeamServing()`, `nextTeamReceiving()`                                                                                               |
| **Point entry**       | `classAction.ts:156`                        | `addPoint(point)`                                                                                                                        |
| **Player metadata**   | `env.ts:126`, `displayUpdate.ts:69`         | `metadata.players()`, `metadata.definePlayer()`, `metadata.defineMatch()`, `metadata.defineTournament()`, `metadata.updateParticipant()` |
| **Format info**       | `displayUpdate.ts:39`, `GameTreePage.ts:59` | `format.code`, `format.setsToWin`, `format.structure`, `format.changeFormat()`                                                           |
| **Momentum chart**    | `MomentumPage.ts:83`                        | `history.action('addPoint')` → episode array                                                                                             |
| **PTS chart**         | `MomentumPage.ts:118`                       | `history.action('addPoint')` → episode array                                                                                             |
| **Button visibility** | `displayUpdate.ts:119`                      | `history.action('addPoint')` → episode array with `needed`                                                                               |
| **Match archiving**   | `env.ts:152,172-175`                        | `history.points()`, `metadata.defineMatch()`, `scoreboard()`                                                                             |
| **Undo**              | `viewManager.ts`                            | `undo()` (replay from scratch)                                                                                                           |
| **Events**            | `env.ts:115`                                | `events.clearEvents()`                                                                                                                   |
| **Side swap**         | `displayUpdate.ts:204`                      | `groupGames()` (derived from v3 history)                                                                                                 |
| **Set access**        | `updateStats.ts:10`, `StatsPage.ts:57`      | `sets().length`                                                                                                                          |

### What UMOv4 (`env.matchUp`) Drives

| Responsibility             | Files                       | Methods Used                                                          |
| -------------------------- | --------------------------- | --------------------------------------------------------------------- |
| **Statistics (PRIMARY)**   | `updateStats.ts:14,128`     | `stats.calculated(setFilter)`, `stats.counters(setFilter)`            |
| **GameTree visualization** | `GameTreePage.ts:55`        | `history.action('addPoint')` → episode array                          |
| **Shadow point entry**     | `classAction.ts:160`        | `addPoint(pointForV4)`                                                |
| **Parallel comparison**    | `MomentumPage.ts:87-93,122` | `history.points`, `history.action('addPoint')` (logged, not rendered) |

### Factory ScoringEngine — What It Provides

The `ScoringEngine` class (factory `src/assemblies/engines/scoring/ScoringEngine.ts`) provides:

- `addPoint(options)` — Point-by-point scoring with format-driven rules
- `getScore()` → `{ sets, scoreString, games, points }` — Current score
- `getScoreboard(options?)` → display string
- `getWinner()` → winning side (1 or 2)
- `isComplete()` → boolean
- `getState()` → raw TODS MatchUp object
- `setState(matchUp)` — Load from JSON
- `undo(count?)` / `redo(count?)` — Native undo/redo via entry timeline
- `decoratePoint(index, metadata)` — Attach metadata to points
- `editPoint(index, newData)` — Edit with recalculation
- `setInitialScore(options)` — Late arrival support
- `addGame(options)` / `addSet(options)` / `endSegment(options)` — Multi-level input
- `setLineUp()` / `substitute()` — Substitution tracking
- CompetitionFormat profiles (penalty, point, timer, timeout, substitution, player rules)

### Factory ScoringEngine — What It Does NOT Provide

| Missing Capability                                        | Currently From    | Notes                                                                                                                                                   |
| --------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Statistics** (`stats.calculated()`, `stats.counters()`) | UMO v4 adapter    | Stats module exists in factory at `src/query/scoring/statistics/` as `calculateMatchStatistics()` standalone function, but not wired into ScoringEngine |
| **Episode format** (`history.action('addPoint')`)         | UMO v3/v4 adapter | Visualizations need per-point context: `{ point, game, set, needed, next_service }`                                                                     |
| **Player metadata**                                       | UMO v3 adapter    | `metadata.players()`, `definePlayer()`, etc. — ScoringEngine is metadata-agnostic                                                                       |
| **Server tracking**                                       | UMO v3 adapter    | `nextTeamServing()` — ScoringEngine derives server within addPoint but doesn't expose server query                                                      |
| **v3-style `score()` format**                             | UMO v3 adapter    | `score()` returns `{ counters: { sets, games }, points: "15-30", components: { sets } }` — richer than ScoringEngine's `getScore()`                     |
| **Format structure query**                                | UMO v3 adapter    | `format.structure`, `format.setsToWin` — ScoringEngine has `getFormat()` (string only)                                                                  |

---

## 2. The Episode Transform: Critical Missing Piece

The visualizations (GameTree, Momentum, PTS) all consume **episode arrays** from `history.action('addPoint')`. Each episode has:

```typescript
{
  action: 'addPoint',
  point: { winner, server, pointNumber, index, breakpoint, score, set, game, ... },
  game: { complete, winner, games: [s1, s2], index },
  set: { complete, winner, sets: [...], index },
  needed: { points_to_game: [n, n], points_to_set: [n, n], games_to_set: [n, n] },
  next_service: 0 | 1,
  result: true,
  complete: boolean,
}
```

This is essentially a **projection of the matchUp state at each point**, which the ScoringEngine's `matchUp.history.points[]` already contains in raw form (each point has `pointNumber`, `set`, `game`, `score`, `pointsToGame`, `pointsToSet`, `pointsToMatch`, `gamesToSet`, `isBreakpoint`, `serveSide`).

**The gap is a transform function** that converts the raw TODS point history into the episode format that visualizations consume. This transform is currently embedded in the UMO v3 adapter.

---

## 3. Migration Strategy

### Phase 1: Create `scoringVisualizations` Repository

A standalone library that:

- Accepts **ScoringEngine state** (TODS MatchUp) as input
- Transforms point history into episode format for visualizations
- Exports D3 visualization components (GameTree, Momentum, PTS, GameFish, Corona)
- Has zero dependency on UMO v3 or v4 adapters

#### 1A. Episode Transform Module

Create `buildEpisodes(matchUp: MatchUp): Episode[]` — a pure function that reads `matchUp.history.points` and produces the episode array. The raw point data from the ScoringEngine already has all the necessary fields:

| Episode field           | Source in `matchUp.history.points[i]`                           |
| ----------------------- | --------------------------------------------------------------- |
| `point.winner`          | `point.winner`                                                  |
| `point.server`          | `point.server`                                                  |
| `point.index`           | `point.index` (v3 compat field)                                 |
| `point.set`             | `point.set` (v3 compat field)                                   |
| `point.game`            | `point.game` (v3 compat field)                                  |
| `point.score`           | `point.score`                                                   |
| `point.breakpoint`      | `point.isBreakpoint`                                            |
| `needed.points_to_game` | `point.pointsToGame`                                            |
| `needed.points_to_set`  | `point.pointsToSet`                                             |
| `needed.games_to_set`   | `point.gamesToSet`                                              |
| `game.complete`         | Derived: next point has different game index                    |
| `game.winner`           | Derived: when game completes, which side's game count increased |
| `game.games`            | Derived from set scores at that point                           |
| `set.complete`          | Derived: next point has different set index                     |
| `set.winner`            | Derived: `matchUp.score.sets[setIndex].winningSide`             |
| `next_service`          | Next point's `server` field                                     |

#### 1B. Statistics Integration

The factory already has `calculateMatchStatistics()` at `src/query/scoring/statistics/standalone.ts`. This can be used directly. The `scoringVisualizations` repo can import and re-export it, or the tracker can import from factory directly.

#### 1C. Visualization Components

Extract and modernize from hive-eye-tracker:

- `gameTree.ts` → D3 v7 module accepting episodes
- `momentumChart.ts` → D3 v7 module accepting episodes
- `ptsChart.ts` → D3 v7 module accepting episodes + sets
- `gameFish.ts` → D3 v7 module accepting point data
- `simpleChart.ts` → D3 v7 module for stat bar charts

Each visualization becomes a pure function: `render(container, episodes, options)`.

### Phase 2: Integrate `scoringVisualizations` into Tracker

#### 2A. Replace `env.matchUp` (UMO v4) with Factory ScoringEngine

```typescript
// Before (env.ts)
import { Match as MatchV4 } from '@tennisvisuals/universal-match-object/v4-umo';
env.matchUp = MatchV4({ matchUpFormat: 'SET3-S:6/TB7' });

// After (env.ts)
import { ScoringEngine } from 'tods-competition-factory';
env.engine = new ScoringEngine({ matchUpFormat: 'SET3-S:6/TB7' });
```

#### 2B. Replace `env.match` (UMO v3) — Incremental

The v3 object provides several services. Replace each incrementally:

1. **Score display** (`score()`) → `engine.getScore()` + thin adapter for v3 counters format
2. **Scoreboard** → `engine.getScoreboard()`
3. **Server tracking** → Derive from `engine.getState().history.points` (last point's server info)
4. **Point entry** → `engine.addPoint()`
5. **Undo/redo** → `engine.undo()` / `engine.redo()` (native, better than v3)
6. **Match archiving** → `engine.getState()` returns TODS matchUp directly
7. **Format info** → `engine.getFormat()` + `parseFormat()` from factory
8. **Visualization data** → `buildEpisodes(engine.getState())` from scoringVisualizations
9. **Statistics** → `calculateMatchStatistics(engine.getState(), ...)` from factory
10. **Player metadata** → Manage separately (ScoringEngine is metadata-agnostic; store in TODS matchUp sides)

#### 2C. Remove UMO Dependencies

Once all consumers are migrated:

- Remove `@tennisvisuals/universal-match-object` dependency
- Remove `env.match` and `env.matchUp`
- Single `env.engine` (ScoringEngine) + metadata store

### Phase 3: Polish

- Remove all `console.log` debugging statements
- Remove v3/v4 comparison code
- Clean up dead imports
- Update storage adapter to save/load ScoringEngine state

---

## 4. Implementation Order

### Step 1: `scoringVisualizations` Repository Setup

- Init repo with TypeScript, Vitest, D3 v7
- Create episode transform: `buildEpisodes(matchUp)`
- Write comprehensive tests for episode transform
- Re-export factory statistics API

### Step 2: Migrate Visualizations

- Extract GameTree, Momentum, PTS, GameFish, SimpleChart
- Upgrade each to D3 v7 (already partially done)
- Accept episodes as input (not UMO match objects)
- Add Storybook for visual testing

### Step 3: Wire Tracker to `scoringVisualizations`

- Import `buildEpisodes` and visualization components
- Replace visualization data sources (remove `env.match.history.action()` calls)
- Verify all visualizations render identically

### Step 4: Replace UMO with ScoringEngine in Tracker

- Replace point entry flow (classAction.ts)
- Replace score display (displayUpdate.ts)
- Replace server tracking
- Replace undo/redo
- Replace statistics source
- Build metadata management layer (player names, tournament info)
- Update storage adapter

### Step 5: Remove UMO

- Remove `@tennisvisuals/universal-match-object` dependency
- Remove `env.match`, `env.matchUp`
- Final cleanup

---

## 5. Risk Assessment

| Risk                                                | Mitigation                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Episode transform has subtle differences from v3/v4 | Write parity tests: replay same points through UMO and ScoringEngine, compare episode output field by field                 |
| Statistics regression                               | Factory's `calculateMatchStatistics()` is the same code as UMO v4's stats; parity is guaranteed                             |
| Player metadata not in ScoringEngine                | Simple to manage separately — TODS matchUp has `sides[].participant`                                                        |
| Server derivation differs                           | ScoringEngine's addPoint already derives server; extract from point history                                                 |
| Storage format changes                              | Backward-compatible: ScoringEngine state IS a TODS matchUp; existing archived matches can be loaded via `engine.setState()` |
| GameTree D3 update issue (pre-existing)             | Address during D3 v7 migration in scoringVisualizations                                                                     |
