# Browser Runtime Fixes for UMO v4 Migration

**Date**: January 20, 2026  
**Status**: 🔧 Iterative Debugging

---

## Issues Found and Fixed

### 1. ✅ Missing `events` API
**Error**: `Cannot read properties of undefined (reading 'addPoint')`  
**Location**: `events.ts:5`

**Root Cause**: v3 adapter didn't include `events` object

**Fix**: Added complete events API to v3 adapter:
```typescript
events: {
  addPoint: (callback: Function) => { ... },
  undo: (callback: Function) => { ... },
  reset: (callback: Function) => { ... },
  clearEvents: () => { ... },
}
```

**Commit**: `feat: add events API to v3 adapter` (9ad48c8)

---

### 2. ✅ `defineMatch()` Null Reference
**Error**: `Cannot read properties of undefined (reading 'id')`  
**Location**: `v3Adapter.ts:227`

**Root Cause**: `defineMatch()` called without arguments but tried to access `match.id`

**Fix**: Added null check and getter/setter pattern:
```typescript
defineMatch: (match?: any) => {
  // Getter mode (no args)
  if (match === undefined) {
    return {
      id: matchUp.matchUpId,
      court: matchUp.court,
      umpire: matchUp.umpire,
      // ... etc
    };
  }
  
  // Setter mode (with args)
  if (match.id) matchUp.matchUpId = match.id;
  // ... etc
}
```

**Commits**:
- `fix: add null check in defineMatch to prevent crash` (6921cab)
- `fix: defineMatch now supports getter mode (no args)` (ef43f22)

---

### 3. ✅ `defineTournament()` Not a Function
**Error**: `env.match.metadata.defineTournament is not a function`  
**Location**: `displayUpdate.ts:87`

**Root Cause**: v3 adapter didn't include `defineTournament()` method

**Fix**: Added getter/setter for tournament metadata:
```typescript
defineTournament: (tournament?: any) => {
  // Getter mode (no args)
  if (tournament === undefined) {
    return {
      name: matchUp.tournamentName,
      category: matchUp.category,
      level: matchUp.level,
    };
  }
  
  // Setter mode (with args)
  if (tournament.name) matchUp.tournamentName = tournament.name;
  // ... etc
}
```

**Commit**: `feat: add defineTournament to metadata API` (7752f2d)

---

### 4. ✅ `timestamps()` Not a Function
**Error**: `env.match.metadata.timestamps is not a function`  
**Location**: `loadMatch.ts:67`

**Root Cause**: v3 adapter missing metadata utility methods

**Fix**: Added utility methods with getter/setter pattern:
```typescript
timestamps: (value?: boolean) => {
  if (value !== undefined) {
    matchUp.useTimestamps = value;
    return matchObj;
  }
  return matchUp.useTimestamps || false;
},
liveStats: (value?) => { ... },
resetStats: () => { ... },
reset: () => { ... }
```

**Commit**: `feat: add timestamps, liveStats, resetStats, and reset to metadata API` (latest)

---

## ⚠️ Major Limitation: Statistics Not Implemented

**Issue:** UMO v4 focuses purely on scoring and doesn't track point metadata or statistics.

**What's Missing:**
- `match.stats.calculated(setFilter?)` - Returns computed statistics
- `match.stats.counters(setFilter?)` - Returns raw point counts

**Why This Matters:**
The stats page in epixodic shows:
- ✅ Basic counts (total points, max streaks) - Working
- ❌ Aces, double faults - **Missing**
- ❌ Winners, unforced errors, forced errors - **Missing**
- ❌ First serve %, points won on serve - **Missing**
- ❌ Stroke breakdowns (forehand/backhand) - **Missing**

**v3 Statistics System:**
```typescript
// v3 tracks metadata on each point
point = {
  winner: 0,
  result: 'Ace' | 'Winner' | 'Unforced Error' | 'Double Fault' | etc,
  stroke: 'Forehand' | 'Backhand' | 'Volley' | etc,
  hand: 'Forehand' | 'Backhand',
  rally: [/* shot sequence */],
  // ... other metadata
}

// v3 builds statistics from point metadata
const counters = match.stats.counters(setFilter);
// Returns: { teams: { 0: { aces: [...], winners: [...] }, 1: { ... } } }

const stats = match.stats.calculated(setFilter);
// Returns: [{ category: 'Aces', teams: [{ value: 5 }, { value: 3 }] }, ...]
```

**v4 Only Tracks:**
```typescript
// v4 only stores winner
point = {
  winner: 0 | 1,
  // No metadata!
}
```

**Implementation Required:**
To support statistics in v4 adapter, we'd need to:

1. **Extend addPoint()** to accept and store metadata
```typescript
addPoint: (winner, metadata) => {
  // Store: metadata.result, metadata.stroke, metadata.hand, etc.
}
```

2. **Track point episodes** with full metadata
```typescript
// Build history with metadata
episodes.push({
  point: { winner, result, stroke, hand, ... },
  action: 'addPoint',
  ...
});
```

3. **Implement counters()** - Aggregate points by category
```typescript
stats.counters(setFilter) {
  // Group points by: aces, winners, errors, serves, etc.
  // Return: { teams: { 0: { aces: [...], winners: [...] }, 1: {...} } }
}
```

4. **Implement calculated()** - Compute statistics
```typescript
stats.calculated(setFilter) {
  // Calculate: percentages, margins, streaks
  // Return: [{ category, teams: [{value, display}] }]
}
```

**Workaround:**
For now, v3 adapter returns empty/stub statistics:
- `counters()` returns minimal structure
- `calculated()` returns only basic counts (points won, max streaks)

**Path Forward:**
- **Option A:** Implement full statistics in v4 adapter (significant work)
- **Option B:** Wait for v4 to add native statistics support
- **Option C:** Stay on v3 for now if statistics are critical

---

## v3 Adapter Completeness

### ✅ Implemented APIs:

**Core Methods:**
- `addPoint(winner, metadata)` - Supports number, string code, or object
- `addPoints(points)` - Batch point addition
- `score()` - Get current score
- `scoreboard()` - Get formatted scoreboard
- `undo()` - Undo last point
- `nextTeamServing()` - Get next server
- `nextTeamReceiving()` - Get next receiver
- `reset()` - Reset match

**Events API:**
- `events.addPoint(callback)`
- `events.undo(callback)`
- `events.reset(callback)`
- `events.clearEvents()`

**Metadata API:**
- `metadata.players()` - Get/set players
- `metadata.definePlayer(player)` - Define player
- `metadata.defineMatch(match?)` - Get/set match metadata (getter/setter)
- `metadata.defineTournament()` - Get tournament info
- `metadata.serviceOrder()` - Get service order
- `metadata.playerTeam(player)` - Get player team
- `metadata.teams()` - Get teams

**History API:**
- `history.points()` - Get all points
- `history.action(actionName)` - Get action history

**Set API:**
- `set.firstService(value?)` - Get/set first server
- `set.perspectiveScore(value?)` - Perspective setting

**Other:**
- `sets()` - Get sets array
- `doubles(isDoubles?)` - Get/set doubles mode
- `format` - Format access

---

## Testing Status

### Browser Console Errors:
- ✅ `events.addPoint` error - **FIXED**
- ✅ `defineMatch.id` error - **FIXED**
- ✅ `defineTournament` not a function - **FIXED**
- ✅ `timestamps` not a function - **FIXED**
- ⏳ Additional errors may appear - continue debugging

### Next:
- Test match creation
- Test point scoring
- Test undo/redo
- Test save/load
- Monitor console for more errors

---

## Pattern for Future Fixes

When encountering browser errors:

1. **Identify the missing API** from error message
2. **Check v3 usage** in epixodic code
3. **Add to v3 adapter** with proper return values
4. **Test in browser** to verify fix
5. **Commit and push** to epixodic-update branch

---

## UMO Commits (epixodic-update branch)

1. `fix: add missing Point type import in PointsEngine` (d5e0b79)
2. `feat: add v4-umo export with v3 adapter and fromMatchUp` (0c541f0)
3. `feat: add events API to v3 adapter` (9ad48c8)
4. `fix: add null check in defineMatch to prevent crash` (6921cab)
5. `fix: defineMatch now supports getter mode (no args)` (ef43f22)

---

## Current Status

✅ Build succeeds  
✅ Events API working  
✅ defineMatch getter/setter working  
⏳ Browser testing in progress  
⏳ Additional APIs may need to be added as issues are discovered
