# Real Data Integration Plan - MCP Parser to UMO v4

**Created:** 2026-02-01  
**Updated:** 2026-02-01  
**Status:** Ready to Begin  
**Estimated Effort:** 8-12 hours

---

## Executive Summary

**COMPLETED (February 2026):**

- ✅ All 7 visualizations migrated to D3 v7 (see `D3_V7_MIGRATION.md`)
- ✅ All visualizations migrated to UMO v4 data structures
- ✅ Adapter layer created for dual format support
- ✅ Rally bars fully functional in ptsChart
- ✅ All visualizations rendering correctly with sample data
- ✅ TypeScript types defined and working
- ✅ Legacy .js files removed (coronaChart.js, RallyTree.js, typeOf.js)
- ✅ Clean TypeScript codebase with zero warnings

**CURRENT GOAL:**

Replace synthetic sample data with real match data from `mcp_charting_points_parser`.

**NEXT STEPS:**

- [ ] Integrate UMO v4 PointsEngine for real-world data processing
- [ ] Connect to mcp_charting_points_parser data source
- [ ] Replace all sample data generators with real data loading
- [ ] Verify all visualizations work with real match data
- [ ] Performance testing with large datasets
- [ ] Remove deprecated sample data generators

---

## Current State

### Completed Visualization Migration (D3 v7 + UMO v4)

All standalone visualizations successfully migrated to D3 v7 and UMO v4 data structures:

| Visualization | D3 v7 | UMO v4 | TypeScript | Notes                          |
| ------------- | ----- | ------ | ---------- | ------------------------------ |
| simpleChart   | ✅    | ✅     | ✅         | Clean and functional           |
| coronaChart   | ✅    | ✅     | ✅         | Rally data rendering correctly |
| RallyTree     | ✅    | ✅     | ✅         | Tree layout working            |
| gameTree      | ✅    | ✅     | ✅         | Complex gradients fixed        |
| gameFish      | ✅    | ✅     | ✅         | Event handlers fixed           |
| momentumChart | ✅    | ✅     | ✅         | Multiple gameFish working      |
| ptsChart      | ✅    | ✅     | ✅         | Rally bars fully functional    |

### Adapter Layer

The `utils/adapters.ts` module provides seamless conversion between formats:

- Detects data format automatically
- Converts legacy format → UMO v4
- Maps all required fields (including `setCumulativePoints`, `rallyLength`)
- Preserves all existing functionality

---

## UMO v4 Data Structure

### Episode Interface (Current)

```typescript
interface Episode {
  point: {
    index: number; // Match-wide point index
    game: number; // Match-wide game index
    set: number; // Set index (0-based)
    server: 0 | 1; // Server side
    winner: 0 | 1; // Point winner
    points: [number, number]; // Game score in points (0-4+)
    score: string; // Tennis score "15-0", "40-30"
    rally?:
      | {
          notation: string; // Rally notation for display
          length?: number; // For rally bars
        }
      | string; // Legacy: just notation string
    rallyLength?: number; // Rally length for calculations
    result: string; // "Ace", "Winner", "Forced Error"
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
    setCumulativePoints?: [number, number]; // Cumulative points in set
    is_breakpoint?: boolean;
  };
}
```

### Key Fields for Visualizations

- **ptsChart**: Needs `needed.setCumulativePoints`, `needed.points_to_set`
- **gameTree**: Uses `point.points` (actual point counts 0-4+)
- **Rally visualizations**: Need `point.rallyLength` or `point.rally.length`
- **All**: Use `game.index` (per-set) for game positioning within sets

---

## Primary Goal: Replace Sample Data with Real Match Data

### Vision

**Current State:** All visualizations work with manually generated sample data
**Target State:** All visualizations consume real match data from MCP charting files

### Goal

Eliminate synthetic sample data generators and connect visualizations to real-world match data using:
1. `mcp_charting_points_parser` - Parse charting notation files
2. UMO v4 PointsEngine - Convert raw points to rich episode data
3. Storybook stories - Load real matches for visualization testing

### Data Flow

**Current (Sample Data):**
```
Manual generators (sampleMatch.ts, sampleGame.ts, sampleGames.ts)
  ↓
Synthetic UMO v4 Episodes
  ↓
Visualizations
```

**Target (Real Data):**
```
MCP Charting Files (.txt, .csv, etc.)
  ↓
mcp_charting_points_parser
  ↓
Raw Point Data (charting format)
  ↓
UMO v4 PointsEngine
  ↓
UMO v4 Episodes (with all derived fields)
  ↓
Visualizations
```

### Files to Eventually Remove

Once real data integration is complete, these sample generators become obsolete:

- `src/visualizations/standalone/data/sampleMatch.ts` - Synthetic match generator
- `src/visualizations/standalone/data/sampleGame.ts` - Synthetic game generator  
- `src/visualizations/standalone/data/sampleGames.ts` - Multiple game scenarios

**Strategy:** Keep them during transition for comparison testing, remove once real data is verified.

---

## Phase 1: Locate MCP Parser & Understand Format (2 hours)

### Goal

Find existing `mcp_charting_points_parser` code and understand its input/output format.

### Tasks

1. **Locate Parser Code** (30 min)
   - Search TennisVisuals GitHub organization
   - Check hive-eye-tracker dependencies
   - Document repository location
   - Review README/documentation

2. **Understand Input Format** (30 min)
   - Identify charting file format (.txt? .csv? custom?)
   - Document notation system
   - Find example charting files
   - Note any format variations

3. **Understand Output Format** (30 min)
   - What data structure does parser produce?
   - Does it align with UMO v4 expectations?
   - What fields are included?
   - Any missing fields we need to derive?

4. **Document Findings** (30 min)
   - Create `MCP_PARSER_INTEGRATION.md`
   - List example charting files for testing
   - Note any gaps or issues
   - Plan transformation logic

**Deliverables:**

- [ ] Parser location documented
- [ ] Input format understood
- [ ] Output format documented
- [ ] Example files identified
- [ ] `MCP_PARSER_INTEGRATION.md` created

---

## Phase 2: UMO v4 PointsEngine Integration (3-4 hours)

### Current State

Sample data generators create episodes manually without using PointsEngine:

```typescript
// src/visualizations/standalone/data/sampleMatch.ts
export function generateSampleMatchUpV4() {
  // Manually creates episodes with all fields
  // Does NOT use PointsEngine
  // DEPRECATED - will be removed
}
```

### Target State

Use UMO v4 PointsEngine to convert MCP parser output to episodes:

```typescript
import { PointsEngine } from '@tennisvisuals/universal-match-object/v4';

export function createMatchFromPoints(points: RawPoint[]) {
  const engine = new PointsEngine({
    matchFormat: { bestOf: 3 },
  });

  points.forEach((point) => {
    engine.addPoint({
      server: point.server,
      winner: point.winner,
      rally: point.rally,
      result: point.result,
    });
  });

  return engine.getState();
}
```

### Tasks

1. **Install/Update UMO v4** (30 min)

   ```bash
   pnpm add @tennisvisuals/universal-match-object@latest
   ```

2. **Create PointsEngine Wrapper** (2 hours)
   - File: `src/utils/umoEngine.ts`
   - Initialize PointsEngine with match format
   - Add point conversion logic
   - Extract episodes with all required fields
   - Handle rally data correctly

3. **Update Sample Data Generators** (1 hour)
   - Modify `sampleMatch.ts` to use PointsEngine
   - Verify all fields populated correctly
   - Test with existing visualizations

4. **Testing** (1 hour)
   - All 8 visualizations still work
   - All fields present and correct
   - Rally bars still working
   - No regressions

**Deliverables:**

- [ ] `src/utils/umoEngine.ts` created
- [ ] Sample generators use PointsEngine
- [ ] All visualizations still work
- [ ] Tests passing

---

## Phase 3: MCP Parser Integration & Real Data Loading (3-4 hours)

### Goal

Connect to real match data from mcp_charting_points_parser.

### MCP Charting Points Parser

**Location:** Check for existing parser in TennisVisuals repositories

**Expected Format:**

```typescript
interface ChartingPoint {
  point: number;
  server: 0 | 1;
  winner: 0 | 1;
  rally: string; // e.g., "4fsb1b2f3"
  result: string; // e.g., "Unforced Error"
  // ... other fields
}
```

### Tasks

1. **Locate MCP Parser** (30 min)
   - Find existing parser code
   - Document input format
   - Document output format

2. **Create Parser Integration** (2 hours)
   - File: `src/utils/mcpParser.ts`
   - Parse MCP format → UMO v4 PointsEngine input
   - Handle rally notation conversion
   - Handle result type mapping

3. **Create Data Loader** (1 hour)
   - File: `src/data/realMatchLoader.ts`
   - Load MCP files
   - Convert via parser
   - Generate episodes via PointsEngine
   - Export for visualizations

4. **Create Storybook Stories** (1 hour)
   - Stories using real match data
   - Multiple matches for testing
   - Compare with sample data

5. **Testing** (1 hour)
   - Real data renders correctly
   - All visualizations work
   - Performance acceptable
   - No data errors

**Deliverables:**

- [ ] `src/utils/mcpParser.ts` created
- [ ] `src/data/realMatchLoader.ts` created
- [ ] Storybook stories with real data
- [ ] All visualizations work with real data

---

## Phase 4: Storybook Integration & Testing (2-3 hours)

### Goal

Replace all Storybook stories to use real match data instead of sample generators.

### Tasks

1. **Update Story Structure** (1 hour)
   ```typescript
   // Before: Using sample data
   import { generateSampleMatchUpV4 } from './data/sampleMatch';
   
   export const Default: Story = {
     render: () => {
       const matchUp = generateSampleMatchUpV4(); // ❌ Synthetic
       // ...
     }
   };
   
   // After: Using real data
   import { loadRealMatch } from './data/realMatchLoader';
   
   export const RealMatch2024Final: Story = {
     render: () => {
       const matchUp = loadRealMatch('2024_wimbledon_final'); // ✅ Real
       // ...
     }
   };
   ```

2. **Create Multiple Real Match Stories** (1 hour)
   - Normal matches (2-3 sets)
   - Long matches (5 sets, 300+ points)
   - Tiebreak heavy matches
   - Various rally patterns
   - Different match formats

3. **Comparison Testing** (30 min)
   - Visual comparison: sample vs real data
   - Verify all features work
   - Check for any rendering differences

**Deliverables:**

- [ ] All stories updated to use real data
- [ ] Sample data imports removed from stories
- [ ] Multiple real match scenarios
- [ ] Visual verification complete

---

## Phase 5: Verification, Performance & Cleanup (2-3 hours)

### Comprehensive Testing

1. **Visual Verification** (1 hour)
   - All visualizations render correctly with real data
   - Check edge cases (long rallies, tiebreaks, etc.)
   - Verify rally bars with real rally data
   - Test various match formats

2. **Performance Testing** (1 hour)
   - Test with large matches (5 sets, 300+ points)
   - Measure render times
   - Check memory usage
   - Identify bottlenecks if any

3. **Data Quality Checks** (30 min)
   - Verify all fields populated
   - Check for missing data
   - Validate rally notation parsing
   - Confirm result types mapped correctly

4. **Remove Sample Data Generators** (30 min)
   - Delete `sampleMatch.ts` (or deprecate if needed elsewhere)
   - Delete `sampleGame.ts` (or deprecate if needed elsewhere)
   - Delete `sampleGames.ts` (or deprecate if needed elsewhere)
   - Update imports in any remaining files
   - Verify nothing breaks

**Deliverables:**

- [ ] All visualizations verified with real data
- [ ] Performance benchmarks documented
- [ ] Sample data generators removed
- [ ] No dependencies on synthetic data
- [ ] Clean codebase using only real match data

---

## Success Criteria

### Technical

- [ ] UMO v4 PointsEngine integrated
- [ ] MCP parser connected
- [ ] All 8 visualizations work with real data
- [ ] Rally bars render with real rally data
- [ ] No TypeScript errors
- [ ] All tests passing

### Performance

- [ ] Large matches (300+ points) render < 1 second
- [ ] No memory leaks
- [ ] Smooth animations (60fps)

### Data Quality

- [ ] All required fields present
- [ ] Rally notation parsed correctly
- [ ] Point results mapped correctly
- [ ] Game/set boundaries accurate
- [ ] Cumulative points calculated correctly

---

## File Structure

### Current
```
src/visualizations/standalone/
├── utils/
│   └── adapters.ts              # ✅ Format conversion (keep)
│
├── data/
│   ├── sampleMatch.ts           # ❌ REMOVE after real data working
│   ├── sampleGames.ts           # ❌ REMOVE after real data working
│   └── sampleGame.ts            # ❌ REMOVE after real data working
│
└── *.stories.ts                 # 📝 Update to use real data
```

### Target
```
src/visualizations/standalone/
├── utils/
│   ├── adapters.ts              # ✅ Format conversion (keep)
│   ├── umoEngine.ts             # 🆕 PointsEngine wrapper
│   └── mcpParser.ts             # 🆕 MCP format parser
│
├── data/
│   ├── realMatchLoader.ts       # 🆕 Load real match data
│   └── realMatches/             # 🆕 Directory of real match files
│       ├── 2024_wimbledon_final.txt
│       ├── 2023_us_open_sf.txt
│       └── ...
│
└── *.stories.ts                 # ✅ Using real data only
```

---

## Risk Assessment

### Low Risk Factors

- ✅ All visualizations already working with UMO v4 structures
- ✅ Adapter layer handles format differences
- ✅ Can test with sample data first
- ✅ Real data integration is additive (not replacing)

### Potential Issues

- ⚠️ MCP parser format may have unexpected variations
- ⚠️ Real data may expose edge cases
- ⚠️ Performance with very large matches

### Mitigation

- Start with small real matches
- Compare output with sample data
- Add validation and error handling
- Performance profiling before optimization

---

## Timeline

### Phase 1: MCP Parser Discovery (2 hours)
- Locate mcp_charting_points_parser
- Understand format
- Document integration approach

### Phase 2: UMO v4 Engine Integration (3-4 hours)
- Install/setup PointsEngine
- Create wrapper
- Test with parsed data

### Phase 3: Real Data Loading (3-4 hours)
- Integrate MCP parser
- Create data loader
- Load real match files

### Phase 4: Storybook Migration (2-3 hours)
- Update all stories to real data
- Remove sample data imports
- Visual testing

### Phase 5: Cleanup (2-3 hours)
- Performance testing
- Remove sample generators
- Documentation
- Final verification

**Total:** ~12-16 hours over 2-3 weeks

---

## Next Steps

### Immediate Actions

1. ✅ D3 v7 migration complete (see `D3_V7_MIGRATION.md`)
2. ✅ Update MIGRATION_PLAN.md (this document)
3. ✅ Create D3_V7_MIGRATION.md as historical reference

### Next Session: Phase 1 - MCP Parser Discovery

**Primary Goals:**
1. [ ] Locate mcp_charting_points_parser code/package
2. [ ] Understand input format (charting files)
3. [ ] Understand output format (parsed points)
4. [ ] Find example charting files for testing
5. [ ] Document integration approach

**Success Criteria:**
- Know where parser code lives
- Understand data flow end-to-end
- Have test files ready
- Clear plan for Phase 2

### Future Sessions

**Phase 2-3:** PointsEngine + MCP integration (1 week)  
**Phase 4:** Storybook story updates (2-3 days)  
**Phase 5:** Testing and cleanup (2-3 days)

**End Goal:** Zero synthetic data, all visualizations using real match data from MCP charting files.

---

## Questions / Notes

- **MCP Parser Location**: Need to locate existing parser code in TennisVisuals repos
- **UMO v4 Version**: Verify latest version has all required features
- **Real Data Samples**: Identify good test matches with various scenarios
- **Performance Baseline**: Current sample data render times as baseline

---

**Status:** Ready to begin UMO v4 engine integration!
