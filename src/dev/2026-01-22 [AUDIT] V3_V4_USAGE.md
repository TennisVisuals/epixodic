# V3/V4 Data Usage Audit

**Date:** 2026-01-22  
**Branch:** feature/v4-visualization-coverage  
**Purpose:** Identify which visualizations are still using UMO V3 data vs V4

---

## Summary

**Status:** ⚠️ **MIXED USAGE** - All visualizations still primarily use V3 data, with V4 running in parallel for testing

---

## Page-by-Page Breakdown

### 🟡 GameTreePage - MIXED (V4 for visualization, V3 for metadata)

**V4 Usage:**

```typescript
Line 67: const v4_transformed_episodes = env.matchUp.history.action('addPoint');
Line 69: let episodes_for_visualization = v4_transformed_episodes;  // ✅ USING V4!
```

**V3 Usage (metadata only):**

```typescript
Line 71: const noAd = env.match.format.structure?.setFormat?.NoAD || false;
Line 78: const players = env.match.metadata.players();
```

**RallyTree (commented out):**

```typescript
Line 179: const point_episodes = env.match.history.action('addPoint');  // V3
Line 183: // const v4_point_episodes = env.matchUp.history?.points...  // V4 ready but commented
```

**Status:** ✅ **GameTree using V4 data**, metadata from V3

---

### 🔴 MomentumPage - V3 PRIMARY (V4 shadow only)

**V3 Usage (active):**

```typescript
Line 83:  const point_episodes = env.match.history.action('addPoint');
Line 117: const point_episodes = env.match.history.action('addPoint');
```

**V4 Usage (shadow testing only):**

```typescript
Line 87:  const v4_point_episodes = env.matchUp.history?.points?.map(...)
Line 121: const v4_point_episodes = env.matchUp.history?.points?.map(...)
```

**Status:** 🔴 **Still using V3 data for visualization**

---

### 🔴 StatsPage - V3 PRIMARY (V4 shadow only)

**V3 Usage (active):**

```typescript
Line 57:  const sets = env.match.sets().length;
Line 104: if (env.match.metadata.resetStats) {
Line 105:   env.match.metadata.resetStats();
```

**V4 Usage (shadow testing only):**

```typescript
Line 61: const v4_sets = env.matchUp.score?.sets?.length || 0;
```

**Status:** 🔴 **Still using V3 data for visualization**

---

### 🔴 PointHistoryPage - V3 PRIMARY (V4 shadow only)

**V3 Usage (active):**

```typescript
Line 65: const points = env.match.history.points();
```

**V4 Usage (shadow testing only):**

```typescript
Line 77: const v4_points = env.matchUp.history?.points || [];
```

**Status:** 🔴 **Still using V3 data for visualization**

---

### 🔴 MainMenuPage - V3 PRIMARY (V4 shadow only)

**V3 Usage (active):**

```typescript
Line 99: const points = env.match.history.points();
```

**V4 Usage (shadow testing only):**

```typescript
Line 103: const v4_points = env.matchUp.history?.points || [];
```

**Status:** 🔴 **Still using V3 data for point count**

---

### 🔴 DetailsPage - V3 ONLY

**V3 Usage (metadata management):**

```typescript
Line 59:  const players = env.match.metadata.players();
Line 60:  const matchInfo = env.match.metadata.defineMatch();
Line 61:  const tournamentInfo = env.match.metadata.defineTournament();
Line 178: const matchInfo = env.match.metadata.defineMatch();
Line 198: env.match.metadata.definePlayer({...});
Line 209-210: env.match.metadata.defineMatch({...});
Line 219-220: env.match.metadata.defineMatch({...});
Line 229-230: env.match.metadata.defineMatch({...});
Line 239-240: env.match.metadata.defineTournament({...});
Line 249-250: env.match.metadata.defineTournament({...});
```

**V4 Usage:** NONE

**Status:** 🔴 **V3 only** (but this is metadata management, not visualization)

---

### ✅ Visualizations Directory - NO DIRECT USAGE

**Result:** No `env.match` or `env.matchUp` references found

All visualization files receive data as parameters from pages - good separation!

---

## Migration Status Matrix

| Page             | V3 Active   | V4 Shadow  | V4 Active        | Status         |
| ---------------- | ----------- | ---------- | ---------------- | -------------- |
| GameTreePage     | Metadata    | No         | ✅ Visualization | 🟢 90% V4      |
| MomentumPage     | ✅ Viz      | ✅ Testing | No               | 🟡 V3 + Shadow |
| StatsPage        | ✅ Viz      | ✅ Testing | No               | 🟡 V3 + Shadow |
| PointHistoryPage | ✅ Viz      | ✅ Testing | No               | 🟡 V3 + Shadow |
| MainMenuPage     | ✅ Count    | ✅ Testing | No               | 🟡 V3 + Shadow |
| DetailsPage      | ✅ Metadata | No         | No               | 🔴 V3 Only     |

---

## V4 Migration Readiness

### ✅ Ready for V4 Switch

**GameTreePage** - Already using V4 for visualization

- Only needs metadata API from V3
- Can switch when V4 metadata APIs available

### 🟡 Has V4 Shadow Testing

**These pages have V4 calls running in parallel:**

- MomentumPage
- StatsPage
- PointHistoryPage
- MainMenuPage

**To switch them to V4:**

1. Change variable usage from V3 to V4 versions
2. Test visualization rendering
3. Remove V3 calls

### 🔴 Needs V4 Implementation

**DetailsPage** - No V4 equivalent yet

- Uses metadata APIs heavily
- Requires V4 metadata implementation first

---

## V4 API Gaps

### Still Using V3 Because V4 Lacks:

1. **Metadata APIs** (used by DetailsPage, GameTreePage)
   - `metadata.players()`
   - `metadata.defineMatch()`
   - `metadata.defineTournament()`
   - `metadata.definePlayer()`
   - `metadata.resetStats()`

2. **Format Structure** (used by GameTreePage)
   - `format.structure?.setFormat?.NoAD`

3. **Sets API** (used by StatsPage)
   - `sets().length`
   - V4 has `score?.sets?.length` as alternative

---

## Next Steps for Full V4 Migration

### Phase 1: Switch Active Visualizations (Easy)

**Estimated:** 30 minutes

1. **MomentumPage** - Change line 83, 117 to use V4 variables
2. **StatsPage** - Change line 57 to use V4 sets
3. **PointHistoryPage** - Change line 65 to use V4 points
4. **MainMenuPage** - Change line 99 to use V4 points

**Then:** Remove V3 shadow calls, test each page

### Phase 2: Implement V4 Metadata APIs (Medium)

**Estimated:** 2-3 hours

Implement in `v3Adapter.ts`:

- `metadata.players()` → `matchUp.participants`
- `metadata.defineMatch()` → `matchUp.matchInfo` or similar
- `metadata.defineTournament()` → `matchUp.tournamentInfo` or similar
- `metadata.definePlayer()` → Add to participants
- `metadata.resetStats()` → V4 equivalent

### Phase 3: Implement V4 Format APIs (Medium)

**Estimated:** 1-2 hours

Implement in `v3Adapter.ts`:

- `format.structure` → Parse from `matchUp.matchUpFormat`
- Extract NoAD, scoring variations

### Phase 4: Switch GameTreePage Metadata (Easy)

**Estimated:** 15 minutes

Once V4 metadata APIs exist:

- Change lines 71, 78 to use V4 APIs

### Phase 5: Migrate DetailsPage (Hard)

**Estimated:** 3-4 hours

Heavy metadata usage:

- All form handlers need V4 equivalents
- Save/load logic needs testing
- User input validation

---

## Recommendations

### Immediate (Tonight/Tomorrow)

✅ **Document current state** (this file) - DONE

### After GameTree Update Issue Fixed

#### Quick Win #1: Switch Shadow-Tested Pages

- MomentumPage, StatsPage, PointHistoryPage, MainMenuPage
- All have V4 data ready, just change variable names
- Low risk, immediate V4 validation

#### Quick Win #2: Remove V3 Shadow Calls

- After pages use V4 data, remove parallel V3 calls
- Clean up logging
- Reduce code duplication

#### Medium Effort: V4 Metadata APIs

- Implement missing metadata methods
- Test with DetailsPage
- Complete V4 migration

---

## Benefits of Completing V4 Migration

1. **Single Code Path** - Remove V3/V4 duplication
2. **Reduced Complexity** - One data model to maintain
3. **Better Performance** - No parallel API calls
4. **Future Proof** - Ready for V3 deprecation
5. **Cleaner Logs** - No more parallel testing noise

---

## Risk Assessment

### Low Risk ✅

- Switching already-shadow-tested pages
- V4 data proven to work in parallel

### Medium Risk ⚠️

- Implementing V4 metadata APIs
- May have edge cases not covered by V3

### High Risk 🔴

- Migrating DetailsPage (complex forms)
- Any bugs affect match setup

---

## Conclusion

**Current State:**

- 1 page using V4 for visualization (GameTreePage)
- 4 pages have V4 shadow testing ready
- 1 page needs V4 APIs first (DetailsPage)

**Path Forward:**

1. Fix GameTree update issue (current blocker)
2. Switch 4 shadow-tested pages to V4 (quick wins)
3. Implement V4 metadata APIs (medium effort)
4. Complete migration (DetailsPage last)

**Timeline:**

- Quick wins: 1 hour
- Full migration: 6-10 hours total
- Can be done incrementally

---

**Last Updated:** 2026-01-22  
**Next Review:** After GameTree update issue resolved
