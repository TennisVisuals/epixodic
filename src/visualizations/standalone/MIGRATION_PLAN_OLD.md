# UMO v4 Engine Integration Plan

**Created:** 2026-02-01  
**Status:** Ready to Begin  
**Estimated Effort:** 8-12 hours

---

## Executive Summary

**COMPLETED:**
- ✅ All 8 visualizations migrated to UMO v4 data structures
- ✅ Adapter layer created for dual format support
- ✅ Rally bars fully functional in ptsChart
- ✅ All visualizations rendering correctly with sample data
- ✅ TypeScript types defined and working

**REMAINING:**
- [ ] Integrate UMO v4 PointsEngine for real-world data processing
- [ ] Connect to mcp_charting_points_parser data source
- [ ] Verify all visualizations work with real match data
- [ ] Performance testing with large datasets

**Note:** D3 v7 migration is a separate effort documented in `D3_V7_MIGRATION.md`

---

## Current State

### Completed Work (January 2026)

All standalone visualizations successfully migrated to accept UMO v4 data structures:

| Visualization | Status | Notes |
|--------------|--------|-------|
| simpleChart   | ✅ Complete | Works with UMO v4 episodes |
| coronaChart   | ✅ Complete | Rally data rendering correctly |
| RallyTree     | ✅ Complete | Tree layout with UMO v4 |
| gameTree      | ✅ Complete | Gradient rendering fixed |
| gameFish      | ✅ Complete | Complex grid rendering working |
| gameChart     | ✅ Complete | Bar charts with UMO v4 |
| momentumChart | ✅ Complete | Multiple gameFish working |
| ptsChart      | ✅ Complete | Rally bars fully functional |

### Adapter Layer

The `utils/adapters.ts` module provides seamless conversion between formats:
- Detects data format automatically
- Converts legacy format → UMO v4
- Maps all required fields (including `setCumulativePoints`, `rallyLength`)
- Preserves all existing functionality
| momentumChart | v4         | Episodes + gameFish | Static         | High       | 12-16      |
| ptsChart      | v4         | Episodes + UMO      | Partial        | High       | 10-14      |

### Current Architecture

```text
Main App (hive-eye-tracker)
├── Uses UMO v3 with accessor methods
├── D3 v4.13.0
└── Visualizations expect objects with methods

Standalone (Storybook)
├── Uses plain Episode arrays (NEW)
├── D3 v4.13.0
├── ptsChart accepts both arrays and UMO objects
└── Sample data generators create Episodes
```

---

## Architecture Insights from Debugging

### Key Learnings

#### 1. Data Structure Requirements

**Episode Structure (Current Working Model):**

```typescript
interface Episode {
  point: {
    index: number;
    game: number; // Match-wide game index
    set: number; // Set index
    server: 0 | 1;
    winner: 0 | 1;
    points: [number, number]; // Game score in points (0-4+)
    score: string; // Tennis score "15-0", "40-30"
    rally?: string; // Rally notation
    result: string; // "Ace", "Winner", "Unforced Error"
    tiebreak?: boolean;
    breakpoint?: boolean;
  };
  game: {
    index: number; // Per-set game index (resets each set!)
    complete: boolean;
    games: [number, number]; // Game score [p0, p1]
  };
  set: {
    index: number;
    complete: boolean;
  };
  needed: {
    points_to_game: [number, number];
    points_to_set: [number, number]; // CRITICAL for ptsChart
    games_to_set: [number, number];
    is_breakpoint?: boolean;
  };
}
```

**Critical Discovery: Game Indexing**

- `point.game` = match-wide index (0, 1, 2, 3...)
- `game.index` = per-set index (resets each set: 0, 1, 2...)
- **ptsChart uses per-set indexing** for game box IDs
- **gameTree uses point.points** (not tennis scores) for node positioning

#### 2. Visualization-Specific Requirements

**ptsChart (Most Complex):**

- Requires nested structure: Match → Sets → Episodes
- Each set needs: `history.points()`, `history.action()`, `complete()`, `winner()`, `scoreboard()`, `metadata.players()`
- Calls `chart.update()` automatically when data changes
- Creates 5 nested ptsSet charts (one per set)
- **Solution:** `chart.data()` detects arrays and creates accessor wrapper on-the-fly

**gameTree:**

- Uses `point.points` array (actual point counts 0-4+)
- Does NOT use tennis scores ("15-0") for positioning
- Calculates progressions like "L0-0x1-0" (0-0 → 15-0)
- Requires `game.complete` to reset progression to 0-0
- **Critical:** Deuce patterns need correct point counts (3-3, 4-3, 4-4, etc.)

**momentumChart:**

- Creates a "school" of gameFish instances
- Each gameFish represents one game
- Requires mouth-to-tail alignment (coords don't accumulate in perpendicular direction)
- Uses `groupGames()` utility to organize Episodes by game

**gameFish:**

- Returns `last_coords = [offset, length, diagonal]`
- Needs GameGroup structure with rally data
- Complex grid and fish cell rendering

#### 3. D3 Selection Patterns Discovered

**Gradient Issue (gameTree):**

```typescript
// BROKEN:
const gradients = canvas.selectAll('.gradient').data(point_lines);
gradients.enter().append('linearGradient').merge(gradients);
const stops = gradients.selectAll('stop')...  // ❌ Missing new gradients!

// FIXED:
const gradientsEnter = gradients.enter().append('linearGradient');
const gradientsMerged = gradientsEnter.merge(gradients);
const stops = gradientsMerged.selectAll('stop')...  // ✅ Includes all
```

**Update Pattern for Real-time:**
All visualizations follow pattern:

1. `chart.data(newData)` - stores data
2. `chart.update()` - re-renders with new data
3. Update can be called repeatedly without re-initializing DOM

---

## UMO v4 Data Model Strategy

### Goals

1. ✅ Plain data structures (no accessor methods)
2. ✅ Type-safe TypeScript interfaces
3. ✅ Easy to serialize/deserialize
4. ✅ Clear, documented structure
5. ✅ Supports incremental updates

### Proposed UMO v4 Episode Structure

```typescript
/**
 * UMO v4 Episode
 * Represents a single point in a match with all contextual data
 */
interface UMOv4Episode {
  // Point data
  point: {
    // Identity
    id: string; // Unique ID: "set0-game5-point12"
    index: number; // Match-wide point number (0-based)
    timestamp?: string; // ISO 8601 timestamp

    // Context
    set: number; // Set index (0-based)
    game: number; // Match-wide game index
    gameInSet: number; // Per-set game index (0-based)
    pointInGame: number; // Point number in this game

    // Participants
    server: 0 | 1; // Which player served
    winner: 0 | 1; // Which player won the point

    // Score State
    gameScore: [number, number]; // Point counts in game (0-4+)
    gamesScore: [number, number]; // Games won in set
    setsScore: [number, number]; // Sets won in match
    tennisScore: string; // "15-0", "40-30", "40-A"

    // Rally Data
    rally?: {
      notation: string; // "4fsb1b2f3"
      length: number; // Number of shots
      duration?: number; // Milliseconds
    };

    // Point Classification
    result: PointResult; // "Ace", "Winner", "Unforced Error"
    stroke?: string; // "Forehand", "Backhand", "Volley"
    hand?: string; // "Forehand", "Backhand"

    // Special Situations
    tiebreak: boolean;
    breakpoint: boolean;
    setpoint: boolean;
    matchpoint: boolean;
  };

  // Derived Context (computed from state)
  context: {
    // What's needed to win
    pointsNeededToWinGame: [number, number];
    pointsNeededToWinSet: [number, number];
    gamesNeededToWinSet: [number, number];

    // Game state
    gameComplete: boolean;
    gameWinner?: 0 | 1;

    // Set state
    setComplete: boolean;
    setWinner?: 0 | 1;

    // Match state
    matchComplete: boolean;
    matchWinner?: 0 | 1;
  };
}

type PointResult =
  | 'Ace'
  | 'Winner'
  | 'Serve Winner'
  | 'Unforced Error'
  | 'Forced Error'
  | 'Touch'
  | 'Net'
  | 'Out'
  | 'Double Fault'
  | 'Passing Shot'
  | 'Volley Error'
  | 'Return Winner';
```

### Match Metadata Structure

```typescript
interface UMOv4Match {
  // Identity
  id: string;
  timestamp: string;

  // Format
  format: {
    bestOf: 3 | 5;
    gamesPerSet: 6 | 8;
    finalSetFormat: 'advantage' | 'tiebreak' | 'super-tiebreak';
    tiebreakAt: number; // Usually 6
    tiebreakGamesTo: number; // Usually 7
    noAd?: boolean; // No-ad scoring
  };

  // Participants
  // IMPORTANT => This needs to move to TODS to contemplate PAIRS for DOUBLES as well as TEAMS
  // SINGLES => participants: [ { participantId, particpantName, participantType: INDIVIDUAL, person }]
  // DOUBLES => participants: [ { participantId, participantName, participantType: PAIR, individualParticipants: [ { participantId, person }] }]
  players: [
    {
      id: string;
      firstName: string;
      lastName: string;
      participantName: string; // Full display name
    },
    {
      id: string;
      firstName: string;
      lastName: string;
      participantName: string;
    },
  ];

  // History
  episodes: UMOv4Episode[];

  // Current State (derived from episodes)
  state: {
    score: {
      sets: [number, number];
      games: [number, number];
      points: [number, number];
    };
    currentSet: number;
    currentGame: number;
    servingSide: 0 | 1;
    server: participantId;
    complete: boolean;
    winningSide?: 0 | 1;
  };
}
```

### Migration Strategy per Visualization

#### Simple Visualizations (Direct Mapping)

**simpleChart, coronaChart, RallyTree:**

```typescript
// Current: Episodes with nested structure
const episodes: Episode[];

// UMO v4: Extract what's needed
const episodes: UMOv4Episode[];

// Adapter (if needed for transition):
function toSimpleEpisode(umo: UMOv4Episode): Episode {
  return {
    point: {
      index: umo.point.index,
      game: umo.point.game,
      set: umo.point.set,
      server: umo.point.server,
      winner: umo.point.winner,
      points: umo.point.gameScore,
      score: umo.point.tennisScore,
      rally: umo.point.rally?.notation,
      result: umo.point.result,
    },
    game: {
      index: umo.point.gameInSet,
      complete: umo.context.gameComplete,
      games: umo.point.gamesScore,
    },
    set: {
      index: umo.point.set,
      complete: umo.context.setComplete,
    },
    needed: {
      points_to_game: umo.context.pointsNeededToWinGame,
      points_to_set: umo.context.pointsNeededToWinSet,
      games_to_set: umo.context.gamesNeededToWinSet,
      is_breakpoint: umo.point.breakpoint,
    },
  };
}
```

#### Complex Visualizations (Grouping Required)

**momentumChart, gameFish:**

```typescript
// Current: Uses groupGames(episodes) utility
function groupGames(episodes: Episode[]): GameGroup[];

// UMO v4: Group by gameInSet
function groupGamesV4(episodes: UMOv4Episode[]): GameGroup[] {
  const games = new Map<string, UMOv4Episode[]>();

  episodes.forEach((ep) => {
    const key = `${ep.point.set}-${ep.point.gameInSet}`;
    if (!games.has(key)) {
      games.set(key, []);
    }
    games.get(key)!.push(ep);
  });

  return Array.from(games.values()).map((gameEpisodes) => ({
    index: gameEpisodes[0].point.gameInSet,
    set: gameEpisodes[0].point.set,
    points: gameEpisodes.map((ep) => ep.point),
    score: gameEpisodes[gameEpisodes.length - 1].point.gamesScore,
    complete: gameEpisodes[gameEpisodes.length - 1].context.gameComplete,
    winner: gameEpisodes[gameEpisodes.length - 1].context.gameWinner,
    last_game: gameEpisodes[gameEpisodes.length - 1].context.setComplete,
  }));
}
```

#### ptsChart (Most Complex)

**Current Approach:**

```typescript
chart.data(episodes: Episode[]) {
  // Creates accessor wrapper:
  match_data = {
    sets: () => groupBySet(episodes).map(setEps => ({
      history: { points: () => ..., action: () => ... },
      complete: () => ...,
      winner: () => ...,
      metadata: { players: () => ... },
      scoreboard: () => ...
    }))
  }
}
```

**UMO v4 Approach:**

```typescript
interface PtsChartData {
  match: UMOv4Match;
  sets: Array<{
    index: number;
    episodes: UMOv4Episode[];
    winner?: 0 | 1;
    complete: boolean;
  }>;
}

chart.data(data: PtsChartData) {
  // Direct access to structured data
  // No need for accessor wrapper
}
```

---

## D3 v7 Migration Strategy

### Phase 1: Setup (30 minutes)

```bash
# Add D3 v7 as alias
pnpm add d3-v7@npm:d3@^7.9.0

# Verify installation
pnpm list d3
pnpm list d3-v7
```

### Phase 2: Code Changes per Visualization

#### Import Changes

**Before (D3 v4):**

```typescript
import * as d3 from 'd3';

// Usage
d3.select('#chart');
d3.scaleLinear();
d3.line();
```

**After (D3 v7):**

```typescript
import {
  select,
  selectAll,
  scaleLinear,
  scaleOrdinal,
  line,
  area,
  axisBottom,
  axisLeft,
  transition,
  // ... only what you need
} from 'd3-v7';

// Usage
select('#chart');
scaleLinear();
line();
```

#### Selection Pattern Changes

**Before (D3 v4):**

```typescript
const circles = svg.selectAll('circle').data(data);

circles.exit().remove();

circles.enter().append('circle').attr('r', 0).merge(circles).transition().attr('r', 5);
```

**After (D3 v7):**

```typescript
svg
  .selectAll('circle')
  .data(data)
  .join(
    (enter) =>
      enter
        .append('circle')
        .attr('r', 0)
        .call((enter) => enter.transition().attr('r', 5)),
    (update) => update.call((update) => update.transition().attr('r', 5)),
    (exit) => exit.call((exit) => exit.transition().attr('r', 0).remove()),
  );

// Or simplified (no transitions):
svg.selectAll('circle').data(data).join('circle').attr('r', 5);
```

#### Event Handler Changes

**Before (D3 v4):**

```typescript
.on('click', function(d, i) {
  const event = d3.event;  // ❌ Removed in v7
  const [x, y] = d3.mouse(this);  // ❌ Removed
  console.log(d, i);
})
```

**After (D3 v7):**

```typescript
.on('click', function(event, d) {  // ✅ event is first param
  const [x, y] = pointer(event);   // ✅ Use pointer()
  console.log(event, d);
})
```

#### Removed Utilities

**Before (D3 v4):**

```typescript
d3.keys(obj); // ❌
d3.values(obj); // ❌
d3.entries(obj); // ❌
d3.map(array); // ❌
d3.set(array); // ❌
```

**After (D3 v7):**

```typescript
Object.keys(obj)      // ✅ Use native JS
Object.values(obj)    // ✅
Object.entries(obj)   // ✅
array.map(...)        // ✅
new Set(array)        // ✅
```

### D3 v7 Migration Checklist (Per Visualization)

- [ ] Update imports from `d3` to `d3-v7` with specific named imports
- [ ] Replace `.enter().append().merge()` with `.join()`
- [ ] Update event handlers: `d3.event` → `event` parameter
- [ ] Replace `d3.mouse()` with `pointer(event)`
- [ ] Replace D3 utilities with native JS (keys, values, entries, map, set)
- [ ] Test all transitions work correctly
- [ ] Test all event handlers work correctly
- [ ] Verify visual output matches v4 version exactly

---

## Real-time Update Strategy

### Update Flow Architecture

```
UMO v4 State Change
  ↓
New Episode Added
  ↓
Notify Subscribers
  ↓
Visualization.update()
  ↓
Re-render with new data
```

### Implementation Approaches

#### Approach 1: Observable Pattern (Recommended)

```typescript
interface VisualizationSubscriber {
  update(episodes: UMOv4Episode[]): void;
}

class UMOv4Match {
  private episodes: UMOv4Episode[] = [];
  private subscribers: Set<VisualizationSubscriber> = new Set();

  subscribe(subscriber: VisualizationSubscriber) {
    this.subscribers.add(subscriber);
  }

  unsubscribe(subscriber: VisualizationSubscriber) {
    this.subscribers.delete(subscriber);
  }

  addPoint(point: Partial<UMOv4Episode>) {
    const episode = this.createEpisode(point);
    this.episodes.push(episode);
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach((sub) => sub.update(this.episodes));
  }
}

// Usage in visualization:
class PtsChartWrapper implements VisualizationSubscriber {
  private chart: any;

  constructor(private match: UMOv4Match) {
    this.chart = ptsChart();
    this.match.subscribe(this);
  }

  update(episodes: UMOv4Episode[]) {
    this.chart.data(episodes);
    this.chart.update();
  }
}
```

#### Approach 2: Event Emitter Pattern

```typescript
import { EventEmitter } from 'events';

class UMOv4Match extends EventEmitter {
  addPoint(point: Partial<UMOv4Episode>) {
    const episode = this.createEpisode(point);
    this.episodes.push(episode);
    this.emit('point:added', episode);
    this.emit('episodes:updated', this.episodes);
  }
}

// Usage:
match.on('episodes:updated', (episodes) => {
  chart.data(episodes);
  chart.update();
});
```

#### Approach 3: Reactive (RxJS)

```typescript
import { BehaviorSubject } from 'rxjs';

class UMOv4Match {
  public episodes$ = new BehaviorSubject<UMOv4Episode[]>([]);

  addPoint(point: Partial<UMOv4Episode>) {
    const episode = this.createEpisode(point);
    const updated = [...this.episodes$.value, episode];
    this.episodes$.next(updated);
  }
}

// Usage:
match.episodes$.subscribe((episodes) => {
  chart.data(episodes);
  chart.update();
});
```

### Update Performance Optimization

```typescript
// Debounce rapid updates
import { debounce } from 'lodash';

const updateChart = debounce((episodes) => {
  chart.data(episodes);
  chart.update();
}, 100);

match.on('episodes:updated', updateChart);

// Or use requestAnimationFrame
let updateScheduled = false;

match.on('episodes:updated', (episodes) => {
  if (!updateScheduled) {
    updateScheduled = true;
    requestAnimationFrame(() => {
      chart.data(episodes);
      chart.update();
      updateScheduled = false;
    });
  }
});
```

---

## Documentation Requirements

### Per-Visualization Documentation Template

Create `{visualization}.md` for each visualization:

````markdown
# {Visualization Name}

## Overview

Brief description of what this visualization shows and when to use it.

## Data Requirements

### Input Format

```typescript
interface InputData {
  // Document exact structure expected
}
```
````

### Example Usage

```typescript
import { visualization } from './visualization';

const chart = visualization();
chart.data(episodes);
d3.select('#container').call(chart);
```

## Configuration Options

### Core Options

#### width

- **Type:** `number`
- **Default:** `800`
- **Description:** Width of visualization in pixels
- **Example:** `chart.width(1000)`

[Continue for all options...]

### Display Options

#### display.sizeToFit

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Automatically resize to container width
- **Example:** `chart.options({ display: { sizeToFit: false } })`

[Continue...]

### Color Options

#### colors.players

- **Type:** `[string, string]`
- **Default:** `['#a55194', '#6b6ecf']`
- **Description:** Colors for player 0 and player 1
- **Example:** `chart.options({ colors: { players: ['red', 'blue'] } })`

## Events

### Available Events

#### update

- **Triggers:** When visualization updates
- **Payload:** `{ begin: Event, end: Event }`
- **Example:**

```typescript
chart.events({
  update: {
    begin: () => console.log('Update started'),
    end: () => console.log('Update finished'),
  },
});
```

## Methods

### data(value)

Sets or gets the data for the visualization.

- **Parameters:** `value: Episode[] | UMOv4Episode[]`
- **Returns:** `this` (for chaining) or current data
- **Example:** `chart.data(episodes)`

### update(opts?)

Re-renders the visualization with current data.

- **Parameters:** `opts?: { sizeToFit?: boolean }`
- **Returns:** `boolean` (success/failure)
- **Example:** `chart.update({ sizeToFit: true })`

## Responsive Behavior

How the visualization handles different container sizes, what minimum dimensions are required, etc.

## Performance Notes

Known performance characteristics, recommended data limits, optimization tips.

## Browser Compatibility

Tested browsers, known issues, fallbacks.

## Related Visualizations

Links to similar or complementary visualizations.

## Examples

Link to Storybook stories demonstrating various configurations.

````

### Documentation Deliverables

For each of 8 visualizations, create:

1. **{viz}.md** - Full documentation (as above)
2. **{viz}.stories.ts** - Storybook stories showing all major options
3. **{viz}.types.ts** - TypeScript interfaces for all options
4. **README.md** update - Add to main visualization index

### Centralized Documentation Index

Update `/src/visualizations/standalone/README.md`:

```markdown
# Standalone Visualizations

Complete visualization library for tennis match data.

## Available Visualizations

| Visualization | Purpose | Complexity | Data | Docs |
|--------------|---------|------------|------|------|
| [simpleChart](./simpleChart.md) | Rally length histogram | Simple | Rally arrays | [Stories](./simpleChart.stories.ts) |
| [coronaChart](./coronaChart.md) | Radial game progression | Medium | Episodes | [Stories](./coronaChart.stories.ts) |
...

## Quick Start

```typescript
import { ptsChart } from './visualizations/standalone';

const chart = ptsChart();
chart.data(episodes);
d3.select('#chart').call(chart);
````

## Common Patterns

### Responsive Charts

All charts support sizeToFit option...

### Color Schemes

Consistent color options across charts...

### Event Handling

All charts support update events...

````

---

## Migration Phases

### Phase 0: Preparation (Week 1) - 8 hours

**Goals:**
- Install D3 v7
- Create UMO v4 type definitions
- Set up testing infrastructure
- Document current behavior

**Tasks:**
1. ✅ Install D3 v7 alias
   ```bash
   pnpm add d3-v7@npm:d3@^7.9.0
````

2. ✅ Create UMO v4 types
   - `src/types/UMOv4.ts` - Core types
   - `src/types/VisualizationData.ts` - Viz-specific types

3. ✅ Set up comparison testing
   - Create visual regression test suite
   - Screenshot current v4 outputs
   - Set up automated comparison

4. ✅ Document current state
   - Take screenshots of all visualizations
   - Document all current bugs/quirks
   - Note all configuration options used

**Deliverables:**

- [ ] D3 v7 installed and verified
- [ ] UMO v4 TypeScript definitions complete
- [ ] Test infrastructure ready
- [ ] Current state documented

---

### Phase 1: Proof of Concept (Week 2) - 12 hours

**Target:** simpleChart (simplest visualization)

**Goals:**

- Validate D3 v7 migration approach
- Validate UMO v4 data structure
- Establish migration pattern
- Test real-time updates

#### Step 1.1: D3 v7 Migration (4 hours)

1. Create `simpleChart-v7.ts`
2. Update imports:
   ```typescript
   import { select, scaleLinear, axisBottom, max } from 'd3-v7';
   ```
3. Replace `.enter().append().merge()` with `.join()`
4. Update event handlers
5. Test side-by-side with v4 version

#### Step 1.2: UMO v4 Data Model (4 hours)

1. Create adapter function:
   ```typescript
   function extractRallyData(episodes: UMOv4Episode[]): number[] {
     return episodes.map((ep) => ep.point.rally?.length || 0).filter((len) => len > 0);
   }
   ```
2. Update `chart.data()` to accept UMO v4
3. Test with sample UMO v4 data

#### Step 1.3: Real-time Updates (2 hours)

1. Create observable wrapper
2. Test adding points incrementally
3. Verify chart updates correctly

#### Step 1.4: Documentation (2 hours)

1. Create `simpleChart.md`
2. Document all options with examples
3. Create comprehensive Storybook stories

**Deliverables:**

- [ ] simpleChart working with D3 v7
- [ ] simpleChart working with UMO v4
- [ ] Real-time updates working
- [ ] Complete documentation
- [ ] Migration lessons learned document

**Success Criteria:**

- ✅ Visual output identical to v4 version
- ✅ All configuration options work
- ✅ Real-time updates smooth (60fps)
- ✅ Documentation complete and clear

---

### Phase 2: Simple Visualizations (Weeks 3-4) - 16 hours

**Targets:** coronaChart, RallyTree

These have straightforward data requirements and no nested charts.

#### Per Visualization (8 hours each):

**Day 1: D3 v7 Migration (4 hours)**

1. Create `{viz}-v7.ts`
2. Update all imports
3. Replace enter/append/merge patterns
4. Update event handlers
5. Side-by-side testing

**Day 2: UMO v4 + Docs (4 hours)**

1. Create UMO v4 adapter
2. Test with real data
3. Implement real-time updates
4. Write complete documentation
5. Create comprehensive stories

**Deliverables (per viz):**

- [ ] D3 v7 version working
- [ ] UMO v4 data model integrated
- [ ] Real-time updates working
- [ ] Full documentation
- [ ] Storybook stories complete

---

### Phase 3: Medium Complexity (Weeks 5-6) - 20 hours

**Targets:** gameTree, gameChart

These have more complex data requirements but no nested components.

#### gameTree Specifics (10 hours)

**Challenges:**

- Uses `point.points` (not tennis scores) for positioning
- Requires deuce pattern handling
- Complex gradient rendering (already fixed)
- Counter calculations

**Approach:**

1. Keep counter calculation logic
2. Adapt to UMO v4 episode structure
3. Ensure deuce patterns work (3-3, 4-4, 4-5, etc.)
4. Test with varied game scenarios

#### gameChart Specifics (10 hours)

Similar complexity to gameTree, follow same pattern.

**Deliverables (per viz):**

- [ ] D3 v7 migration complete
- [ ] UMO v4 data working
- [ ] Complex patterns tested (deuce, tiebreaks)
- [ ] Documentation complete
- [ ] Multiple story variants

---

### Phase 4: High Complexity - gameFish (Week 7) - 16 hours

**Target:** gameFish (most complex single visualization)

**Challenges:**

- Heavy use of enter/append/merge patterns
- Complex grid rendering
- Fish cell calculations
- Returns coords for momentumChart positioning
- Multiple display modes (orientation, service, rally, grid)

**Approach:**

**Day 1-2: D3 v7 Migration (8 hours)**

1. Inventory all selection patterns
2. Create `.join()` versions systematically
3. Test each component (grid, fish, bars, score)
4. Verify coords calculation unchanged

**Day 3: UMO v4 Integration (4 hours)**

1. Update to accept UMO v4 GameGroup
2. Adapt rally data extraction
3. Test with varied game scenarios

**Day 4: Testing & Docs (4 hours)**

1. Test all display options
2. Test all orientations
3. Verify coordinates for momentumChart
4. Complete documentation

**Deliverables:**

- [ ] All selection patterns converted to `.join()`
- [ ] All display modes working
- [ ] Coordinates correct for momentumChart
- [ ] UMO v4 GameGroup support
- [ ] Comprehensive documentation
- [ ] Stories for all configurations

---

### Phase 5: Composite Visualizations (Week 8) - 16 hours

**Targets:** momentumChart, ptsChart

These use other visualizations as components.

#### momentumChart (8 hours)

**Challenges:**

- Creates array of gameFish instances
- Mouth-to-tail positioning (already fixed)
- Complex coordinate calculation
- Multiple sets support

**Approach:**

1. Ensure gameFish v7 is complete first
2. Update to import from gameFish v7
3. Test fish school creation
4. Verify alignment in both orientations
5. Test with full match data

#### ptsChart (8 hours)

**Challenges:**

- Creates 5 nested ptsSet charts
- Complex data structure requirements
- Game box hover (per-set indexing - already fixed)
- Player names and scores display
- Set-by-set rendering

**Approach:**

1. Complete ptsSet migration first
2. Update match-level chart
3. Test set grouping logic
4. Verify all nested interactions work
5. Test with 1-5 sets

**Deliverables (per viz):**

- [ ] Nested components working correctly
- [ ] All interactions functional
- [ ] Real-time updates smooth
- [ ] Full documentation
- [ ] Complex scenarios tested

---

### Phase 6: Integration & Polish (Week 9) - 8 hours

**Goals:**

- Integrate all visualizations
- Remove D3 v4 dependency
- Final testing
- Documentation polish

**Tasks:**

**Day 1: Integration (4 hours)**

1. Update all imports to use v7 versions
2. Remove D3 v4 from package.json
3. Update main app to use UMO v4
4. Test all visualizations in main app

**Day 2: Polish (4 hours)**

1. Review all documentation
2. Add cross-references
3. Create migration guide for external users
4. Performance audit
5. Final visual regression testing

**Deliverables:**

- [ ] All visualizations using D3 v7
- [ ] All visualizations using UMO v4
- [ ] D3 v4 removed from project
- [ ] Complete documentation set
- [ ] Migration guide published
- [ ] Performance benchmarks documented

---

## Success Criteria

### Technical Criteria

#### Visual Output

- [ ] All visualizations render identically to v4 versions
- [ ] No visual regressions in any configuration
- [ ] All transitions smooth and correct
- [ ] All colors and styles preserved

#### Functionality

- [ ] All configuration options working
- [ ] All event handlers working
- [ ] Real-time updates at 60fps
- [ ] No memory leaks on repeated updates
- [ ] Responsive behavior correct

#### Code Quality

- [ ] TypeScript types complete and correct
- [ ] No TypeScript errors or warnings
- [ ] No D3 v4 code remaining
- [ ] Consistent code style across all visualizations
- [ ] All linting rules passing

#### Performance

- [ ] Initial render < 100ms (typical data)
- [ ] Update render < 50ms (incremental)
- [ ] Bundle size reasonable (< 400KB after tree-shaking)
- [ ] No janky animations (maintain 60fps)

### Documentation Criteria

- [ ] All 8 visualizations fully documented
- [ ] All options documented with examples
- [ ] All events documented
- [ ] All methods documented
- [ ] Migration guide complete
- [ ] Storybook stories comprehensive
- [ ] README updated and accurate

### Testing Criteria

- [ ] Visual regression tests passing
- [ ] All Storybook stories rendering
- [ ] Real-time update tests passing
- [ ] Performance benchmarks documented
- [ ] Cross-browser testing complete

---

## Risk Assessment & Mitigation

### High Risks

#### Risk 1: Breaking Changes in D3 v7

**Probability:** Medium  
**Impact:** High  
**Mitigation:**

- Use npm alias to keep v4 available during migration
- Migrate one visualization at a time
- Maintain v4 version until v7 proven identical
- Create automated visual regression tests

#### Risk 2: UMO v4 Structure Incomplete

**Probability:** Medium  
**Impact:** High  
**Mitigation:**

- Start with simplest visualization
- Document all data requirements discovered
- Iterate on structure based on learnings
- Keep adapter layer for flexibility

#### Risk 3: Performance Degradation

**Probability:** Low  
**Impact:** Medium  
**Mitigation:**

- Benchmark before and after migration
- Profile real-time updates
- Implement debouncing/throttling if needed
- Use D3 v7 performance improvements

#### Risk 4: Real-time Updates Complex

**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**

- Design observable pattern carefully
- Test with rapid updates
- Implement update batching
- Use requestAnimationFrame

### Medium Risks

#### Risk 5: Timeline Overrun

**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**

- Buffer 20% extra time per phase
- Identify and address blockers early
- Phase approach allows stopping at any point
- Prioritize critical visualizations

#### Risk 6: Documentation Incomplete

**Probability:** Low  
**Impact:** Low  
**Mitigation:**

- Document as you go, not at end
- Use template for consistency
- Storybook stories serve as living docs
- Review documentation each phase

---

## Immediate Next Steps (This Week)

### Step 1: Install D3 v7 (15 minutes)

```bash
cd /Users/charlesallen/Development/GitHub/TennisVisuals/hive-eye-tracker
pnpm add d3-v7@npm:d3@^7.9.0
pnpm list d3
pnpm list d3-v7
```

Verify both versions installed:

- d3@4.13.0 ✓
- d3-v7@7.9.0 ✓

### Step 2: Create UMO v4 Types (1 hour)

Create `/src/types/UMOv4.ts` with complete type definitions (as outlined above).

### Step 3: Set Up Testing (1 hour)

Install visual regression testing tools:

```bash
pnpm add -D @storybook/addon-storyshots puppeteer
```

Configure screenshot comparison.

### Step 4: Start simpleChart Migration (4 hours)

Create proof-of-concept following Phase 1 plan.

---

## Appendix A: File Structure

```
src/
├── types/
│   ├── UMOv4.ts                    # NEW: UMO v4 types
│   └── VisualizationData.ts        # NEW: Viz-specific types
│
├── visualizations/
│   └── standalone/
│       ├── README.md               # UPDATED: Complete overview
│       ├── MIGRATION_PLAN.md       # THIS FILE
│       ├── MIGRATION_NOTES.md      # Existing D3 v3→v4 notes
│       │
│       ├── types/
│       │   └── index.ts            # UPDATED: Add UMO v4 types
│       │
│       ├── data/
│       │   ├── sampleGame.ts       # UPDATED: Generate UMO v4
│       │   ├── sampleGames.ts      # UPDATED: Generate UMO v4
│       │   └── sampleMatch.ts      # UPDATED: Generate UMO v4
│       │
│       ├── utils/
│       │   ├── observable.ts       # NEW: Observable pattern
│       │   └── adapters.ts         # NEW: UMO v3→v4 adapters
│       │
│       ├── simpleChart/
│       │   ├── simpleChart.ts      # Keep v4 version
│       │   ├── simpleChart-v7.ts   # NEW: D3 v7 version
│       │   ├── simpleChart.md      # NEW: Documentation
│       │   ├── simpleChart.types.ts # NEW: Type definitions
│       │   └── simpleChart.stories.ts # UPDATED: More stories
│       │
│       ├── coronaChart/
│       │   ├── coronaChart.ts      # Keep v4 version
│       │   ├── coronaChart-v7.ts   # NEW: D3 v7 version
│       │   ├── coronaChart.md      # NEW: Documentation
│       │   └── ...
│       │
│       └── ... (repeat for all 8 visualizations)
```

---

## Appendix B: Testing Checklist

### Per-Visualization Testing

#### Visual Regression

- [ ] Default configuration renders identically
- [ ] All color schemes render correctly
- [ ] All size variations render correctly
- [ ] Responsive behavior matches
- [ ] Screenshots match pixel-perfect (allow 0.1% difference)

#### Functional Testing

- [ ] All configuration options work
- [ ] All events fire correctly
- [ ] Update method works repeatedly
- [ ] Data validation works
- [ ] Error handling works

#### Real-time Updates

- [ ] Single point addition works
- [ ] Rapid point additions work (10/sec)
- [ ] Animation is smooth (60fps)
- [ ] No memory leaks after 1000 updates
- [ ] Updates pause/resume correctly

#### Edge Cases

- [ ] Empty data handled
- [ ] Single point handled
- [ ] Very long games handled (40+ points)
- [ ] Multiple deuces handled
- [ ] Tiebreaks handled
- [ ] Complete matches handled (5 sets)

#### Cross-browser

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

#### Performance

- [ ] Initial render < 100ms
- [ ] Update render < 50ms
- [ ] 60fps maintained during animations
- [ ] Memory usage stable
- [ ] CPU usage reasonable

---

## Appendix C: D3 v4 → v7 API Changes Reference

### Core Selection Changes

| D3 v4                       | D3 v7                                 | Notes                   |
| --------------------------- | ------------------------------------- | ----------------------- |
| `import * as d3 from 'd3'`  | `import { select, ... } from 'd3-v7'` | ES6 modules             |
| `d3.select()`               | `select()`                            | Named import            |
| `.enter().append().merge()` | `.join()`                             | Simplified pattern      |
| `d3.event`                  | `event` parameter                     | First param in handlers |
| `d3.mouse(this)`            | `pointer(event)`                      | Use pointer events      |

### Removed Methods

| D3 v4             | JavaScript Equivalent        |
| ----------------- | ---------------------------- |
| `d3.keys(obj)`    | `Object.keys(obj)`           |
| `d3.values(obj)`  | `Object.values(obj)`         |
| `d3.entries(obj)` | `Object.entries(obj)`        |
| `d3.map(array)`   | `array.map()` or `new Map()` |
| `d3.set(array)`   | `new Set(array)`             |

### Shape Generators

All shape generators work the same, just imported differently:

```typescript
// D3 v4
import * as d3 from 'd3';
const line = d3.line();

// D3 v7
import { line } from 'd3-v7';
const lineGenerator = line();
```

### Scales

Same API, just different imports:

```typescript
// D3 v4
const xScale = d3.scaleLinear();

// D3 v7
import { scaleLinear } from 'd3-v7';
const xScale = scaleLinear();
```

---

## Appendix D: Observable Pattern Implementation

### Complete Implementation Example

```typescript
// src/visualizations/utils/observable.ts

export interface Subscriber<T> {
  update(data: T): void;
}

export class Observable<T> {
  private subscribers: Set<Subscriber<T>> = new Set();

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  notify(data: T): void {
    this.subscribers.forEach((subscriber) => {
      subscriber.update(data);
    });
  }

  get subscriberCount(): number {
    return this.subscribers.size;
  }
}

// src/types/UMOv4.ts (Observable UMO)

export class ObservableUMOv4Match extends Observable<UMOv4Episode[]> {
  private episodes: UMOv4Episode[] = [];
  public metadata: MatchMetadata;

  constructor(metadata: MatchMetadata) {
    super();
    this.metadata = metadata;
  }

  addPoint(pointData: Partial<PointData>): UMOv4Episode {
    const episode = this.createEpisode(pointData);
    this.episodes.push(episode);
    this.notify(this.episodes);
    return episode;
  }

  getEpisodes(): UMOv4Episode[] {
    return [...this.episodes]; // Return copy
  }

  private createEpisode(pointData: Partial<PointData>): UMOv4Episode {
    // Create full episode with all derived data
    const lastEpisode = this.episodes[this.episodes.length - 1];

    return {
      point: {
        id: `set${pointData.set}-game${pointData.game}-point${this.episodes.length}`,
        index: this.episodes.length,
        timestamp: new Date().toISOString(),
        // ... calculate all fields
      },
      context: {
        // ... calculate all derived fields
      },
    };
  }
}

// Usage in visualization wrapper

export class ChartWrapper implements Subscriber<UMOv4Episode[]> {
  private chart: any;
  private unsubscribe: () => void;

  constructor(
    private container: HTMLElement,
    private match: ObservableUMOv4Match,
    chartFactory: () => any,
  ) {
    this.chart = chartFactory();
    this.unsubscribe = this.match.subscribe(this);

    // Initial render
    this.update(this.match.getEpisodes());
  }

  update(episodes: UMOv4Episode[]): void {
    this.chart.data(episodes);

    // Only update if chart has been initialized
    if (this.chart.update) {
      this.chart.update();
    }
  }

  destroy(): void {
    this.unsubscribe();
    // Clean up D3 elements
    d3.select(this.container).selectAll('*').remove();
  }
}

// Usage example

import { ptsChart } from './visualizations/standalone/ptsChart-v7';

const match = new ObservableUMOv4Match({
  players: [
    { id: '1', firstName: 'Player', lastName: 'One', participantName: 'Player One' },
    { id: '2', firstName: 'Player', lastName: 'Two', participantName: 'Player Two' },
  ],
  format: {
    bestOf: 3,
    gamesPerSet: 6,
    finalSetFormat: 'tiebreak',
    tiebreakAt: 6,
    tiebreakGamesTo: 7,
  },
});

const wrapper = new ChartWrapper(document.getElementById('chart-container'), match, ptsChart);

// Add points - chart updates automatically
match.addPoint({ server: 0, winner: 1, result: 'Winner' });
match.addPoint({ server: 0, winner: 0, result: 'Ace' });
// ... chart updates in real-time
```

---

## Appendix E: Timeline Gantt Chart

```
Week 1: Preparation
[========] D3 v7 setup, UMO v4 types, testing infrastructure

Week 2: simpleChart POC
[========] D3 v7 migration
[========] UMO v4 integration
[====] Real-time updates
[====] Documentation

Week 3-4: coronaChart & RallyTree
[============] coronaChart migration
[============] RallyTree migration

Week 5-6: gameTree & gameChart
[============] gameTree migration
[============] gameChart migration

Week 7: gameFish
[================] gameFish migration (most complex)

Week 8: momentumChart & ptsChart
[========] momentumChart
[========] ptsChart

Week 9: Integration & Polish
[========] Integration, remove D3 v4, final testing

Total: 9 weeks, ~76 hours
```

---

## Conclusion

This migration plan provides a comprehensive roadmap for modernizing all standalone visualizations to use UMO v4 data model and D3 v7. The phased approach minimizes risk while providing clear milestones and deliverables.

### Key Success Factors

1. **Incremental Approach** - One visualization at a time
2. **Proof of Concept First** - Validate approach with simplest viz
3. **Maintain Backward Compatibility** - Keep v4 versions during migration
4. **Comprehensive Testing** - Visual regression and functional tests
5. **Documentation First** - Document as you go, not at end
6. **Observable Pattern** - Clean architecture for real-time updates

### Immediate Action Items

1. ✅ **Install D3 v7:** `pnpm add d3-v7@npm:d3@^7.9.0`
2. ✅ **Create UMO v4 types:** Define complete TypeScript interfaces
3. ✅ **Start simpleChart POC:** Validate entire approach
4. ✅ **Set up testing:** Visual regression and functional tests

### Long-term Benefits

- ✅ Modern D3 v7 codebase with ES6 modules
- ✅ Clean UMO v4 data model without accessor methods
- ✅ Real-time updates with observable pattern
- ✅ Comprehensive documentation for all visualizations
- ✅ Future-proof architecture for continued development

---

**Status:** Ready to Begin  
**Next Review:** After simpleChart POC completion  
**Questions/Concerns:** [Document any questions here]
