# UMO v4 Statistics Gap Analysis

**Date**: January 20, 2026  
**Migration Status**: ✅ Core functionality working, ⚠️ Statistics not implemented

---

## Executive Summary

The migration to UMO v4 is **functionally complete** for core match scoring, but **statistics tracking is not implemented** in v4. The stats page currently shows only basic counts (points won, max streaks) but is missing all detailed statistics (aces, winners, errors, serve percentages, etc.).

**Impact:** High - Statistics are a key feature of hive-eye

**Recommendation:** See "Decision Matrix" below

---

## What's Working ✅

### Core Functionality (100%)
- ✅ Match creation and initialization
- ✅ Point scoring (addPoint, addPoints)
- ✅ Undo functionality
- ✅ Score queries (score, scoreboard, winner)
- ✅ Match metadata (players, match details, tournament)
- ✅ Format handling
- ✅ TODS matchUp conversion
- ✅ Save/load matches
- ✅ Browser runs without errors

### Basic Statistics (20%)
- ✅ Total points won
- ✅ Max points in a row
- ✅ Max games in a row

---

## What's Missing ❌

### Detailed Statistics (80%)
- ❌ Aces
- ❌ Double faults
- ❌ Winners (total and by stroke)
- ❌ Unforced errors (total and by stroke)
- ❌ Forced errors
- ❌ First serve %
- ❌ Points won on 1st serve
- ❌ Points won on 2nd serve
- ❌ Points won receiving
- ❌ Breakpoints saved/converted
- ❌ Stroke breakdowns (forehand/backhand)
- ❌ Rally length tracking
- ❌ Serve location tracking
- ❌ Return location tracking

---

## Root Cause Analysis

### v3 Architecture
```typescript
// v3 Match Object stores rich point metadata
{
  winner: 0,
  server: 1,
  result: 'Ace',              // ← Statistics source
  stroke: 'Forehand',          // ← Statistics source  
  hand: 'Right',               // ← Statistics source
  rally: [/* shots */],        // ← Statistics source
  location: 'Wide',            // ← Statistics source
  breakpoint: true,            // ← Statistics source
  // ... more metadata
}

// v3 Statistics API
match.stats.counters(setFilter)
  → { teams: { 
      0: { aces: [...], winners: [...], unforcedErrors: [...] },
      1: { ... }
    }}

match.stats.calculated(setFilter)
  → [
      { category: 'Aces', teams: [{ value: 5, display: '5' }, { value: 3, display: '3' }] },
      { category: 'Winners', teams: [{ value: 12, display: '12' }, { value: 8, display: '8' }] },
      // ...
    ]
```

### v4 Architecture
```typescript
// v4 PointsEngine stores minimal data
{
  winner: 0,
  // NO METADATA!
}

// v4 has NO statistics API
// Only: addPoint, getScore, undo
```

**Conclusion:** v4 is a pure scoring engine. Statistics tracking is out of scope.

---

## Technical Implementation Requirements

To add statistics support to the v4 adapter, we would need:

### 1. Point Metadata Storage (~200 lines)
```typescript
// Extend addPoint to accept metadata
interface PointMetadata {
  result?: 'Ace' | 'Winner' | 'Unforced Error' | 'Forced Error' | 'Double Fault';
  stroke?: 'Forehand' | 'Backhand' | 'Volley' | 'Overhead' | 'Drop Shot';
  hand?: 'Forehand' | 'Backhand';
  rally?: Shot[];
  location?: string;
  breakpoint?: boolean;
}

addPoint: (winner: number, metadata?: PointMetadata) => {
  // Store metadata alongside winner
  pointHistory.push({ winner, ...metadata });
}
```

### 2. Statistics Counters (~300 lines)
```typescript
stats.counters(setFilter?: number) {
  // Build counters from point history
  const episodes = filterBySet(pointHistory, setFilter);
  
  const teams = { 0: {}, 1: {} };
  
  episodes.forEach(episode => {
    const team = episode.winner;
    
    // Count by result
    if (episode.result === 'Ace') {
      teams[team].aces = teams[team].aces || [];
      teams[team].aces.push(episode);
    }
    // ... repeat for all stat categories
  });
  
  return { teams };
}
```

### 3. Calculated Statistics (~400 lines)
```typescript
stats.calculated(setFilter?: number) {
  const counters = stats.counters(setFilter);
  
  return [
    {
      category: 'Aces',
      teams: [
        { value: counters.teams[0].aces?.length || 0, display: '...' },
        { value: counters.teams[1].aces?.length || 0, display: '...' }
      ]
    },
    {
      category: 'First Serve %',
      teams: calculatePercentages(counters, 'serves1stIn', 'pointsServed')
    },
    // ... all statistics calculations
  ];
}
```

**Total Effort:** ~900-1000 lines of code + comprehensive testing

**Time Estimate:** 2-3 days of development + 1 day testing

---

## Decision Matrix

### Option A: Implement Statistics in v4 Adapter ⚙️

**Pros:**
- ✅ Complete feature parity with v3
- ✅ Modern v4 architecture
- ✅ Future-proof for v4 enhancements
- ✅ Learning opportunity

**Cons:**
- ❌ Significant development effort (~3-4 days)
- ❌ Duplicating v3 logic (maintenance burden)
- ❌ Testing complexity
- ❌ May need updates as hive-eye evolves

**Best For:** Long-term investment, modernization priority

---

### Option B: Wait for v4 Native Statistics 🕐

**Pros:**
- ✅ No duplication of effort
- ✅ Official implementation
- ✅ Better performance (native)

**Cons:**
- ❌ Unknown timeline
- ❌ May never happen (v4 is scoring-focused)
- ❌ Blocks migration completion

**Best For:** Not recommended (too uncertain)

---

### Option C: Stay on v3 for Now 🔙

**Pros:**
- ✅ All features working immediately
- ✅ Zero development effort
- ✅ Battle-tested and stable
- ✅ Can migrate later when v4 matures

**Cons:**
- ❌ Miss out on v4 improvements
- ❌ May have v3 deprecation issues later

**Best For:** Pragmatic choice if statistics are critical

---

### Option D: Hybrid Approach 🔀

**Pros:**
- ✅ Use v4 for new matches (modern)
- ✅ Keep v3 for existing matches (compatibility)
- ✅ Gradual migration path

**Cons:**
- ❌ Maintain two code paths
- ❌ Complexity

**Best For:** Transitional strategy

---

## Recommendation

**For Production Use:** **Option C** (Stay on v3)

**Rationale:**
1. Statistics are a **core feature** of hive-eye
2. v4 adapter statistics would be **duplicate effort**
3. v3 is **stable and working**
4. Can revisit v4 when:
   - v4 adds native statistics support, OR
   - Business case justifies 3-4 days development

**For Exploration/Learning:** **Option A** (Implement Statistics)

**Rationale:**
- Good learning exercise
- Proves out v4 adapter pattern
- May reveal other v4 limitations

---

## Current Branch Status

**UMO:** `hive-eye-update` branch
- ✅ v4-umo adapter complete (scoring only)
- ✅ All v3 APIs stubbed
- ⚠️ Statistics return empty/minimal data

**Hive-Eye:** `feature/umo-4.0` branch  
- ✅ All imports updated
- ✅ Build succeeds
- ✅ Browser runs
- ⚠️ Stats page shows only basic counts

**Test Coverage:**
- ✅ Core functionality: 100%
- ⚠️ Statistics: 20%

---

## Next Steps

### If Proceeding with Option A (Implement Statistics):

1. **Phase 1:** Point metadata storage (1 day)
   - Extend addPoint signature
   - Store metadata in history
   - Update undo to restore metadata

2. **Phase 2:** Counters implementation (1 day)
   - Build statistics counters from history
   - Support set filtering
   - Test with real match data

3. **Phase 3:** Calculated statistics (1 day)
   - Implement all stat calculations
   - Match v3 output format exactly
   - Integration testing

4. **Phase 4:** Testing & refinement (1 day)
   - Browser testing
   - Stats page validation
   - Edge cases

### If Proceeding with Option C (Stay on v3):

1. **Revert to v3**
   - Switch hive-eye back to v3 imports
   - Keep v4 adapter work for future

2. **Monitor v4 development**
   - Watch for statistics support
   - Revisit migration when ready

---

## Conclusion

UMO v4 migration is **technically successful** - all core scoring works perfectly. The statistics gap is **architectural** - v4 is designed as a pure scoring engine without metadata tracking.

**Recommended:** Stay on v3 until statistics can be properly addressed, either through:
- Native v4 statistics support, or
- Justified business case for 3-4 day adapter implementation

The v4 adapter work is **not wasted** - it proves the concept and provides a clear path forward when timing is right.
