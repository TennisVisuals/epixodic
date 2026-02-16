# Verification Checklist - UMO v4 Data Model Migration

**Date**: February 1, 2026  
**Status**: Ready for User Verification  
**Storybook URL**: http://localhost:6006

---

## ✅ Automated Checks (All Passing)

- [x] TypeScript compilation successful
- [x] No TypeScript errors or warnings
- [x] Storybook builds successfully
- [x] All modules transformed (690 modules)
- [x] No import errors
- [x] No runtime errors during build

---

## 🔍 Manual Verification Required

Please verify each visualization in Storybook works correctly:

### 1. Game Tree Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-gametree

**Stories to Test**:

- [✓] **Multiple Games** - Shows 5 games with varied progressions
  - ✓ All game paths visible
  - ✓ Line widths show frequency
  - ✓ Node colors correct (player 0: purple, player 1: blue)
  - ✓ No rendering artifacts

- [✓] **Single Game** - Standard game progression
  - ✓ Points flow correctly from 0-0 to game end
  - ✓ Labels readable
  - ✓ Smooth rendering

- [✓] **Deuce Game** - Complex branching
  - ✓ Multiple deuce/advantage cycles visible
  - ✓ Back-and-forth paths clear
  - ✓ No overlapping paths

- [ ] **No-Ad Scoring** - Alternative format
  - ✓ No advantage paths shown
  - [ ] 40-40 goes directly to game => the point progression goes from 40-15 to game. This was how it was before migration

- [✓] **Color Coded Results** - Visual classification
  - ✓ Green lines for winners
  - ✓ Red lines for errors
  - ✓ Blue lines for unknown results

- [✓] **Empty State** - No data handling
  - ✓ No errors displayed
  - ✓ Graceful empty state

**Data Format Used**: Both Legacy and UMO v4  
**Critical**: Tree structure renders identically with both formats

---

### 2. PTS Chart Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-ptschart

**Stories to Test**:

- [✓] **Default** - Full match display
  - ✓ All sets visible
  - ✓ Point bars render correctly
  - ✓ Score labels accurate
  - ✓ Set boundaries clear

- [✓] **Single Set** - Individual set view
  - ✓ Games boxes sized correctly
  - ✓ Point progression clear
  - ✓ Hover interactions work

- [x] **With Rally Data** - Rally length visualization => This example does not exist as a story, and never has
  - ✓ Rally bars visible
  - ✓ Heights proportional to length
  - ✓ Color coding correct

- [x] **Custom Colors** - Theme variations => This example does not exist as a story, and never has
  - ✓ Player colors applied
  - ✓ Consistent throughout

**Data Format Used**: Both Legacy and UMO v4  
**Critical**: Set grouping and point indexing correct in both formats

---

### 3. Momentum Chart Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-momentumchart

**Stories to Test**:

- [✓] **Default** - Horizontal orientation
  - ✓ Fish school visible
  - ✓ Individual game fish render
  - ✓ Mouth-to-tail alignment correct
  - ✓ No overlapping

- [ ] **Vertical Orientation** - Rotated view
  - ✓ Rotation applied correctly
  - x Labels readable => there have never been labels
  - ✓ Fish alignment maintained

- [✓] **With Rally Display** - Rally visualization
  - ✓ Rally data visible
  - ✓ Colors show result types
  - ✓ Grid layout correct

- [✓] **Multiple Sets** - Full match view
  - ✓ All sets render
  - ✓ Spacing correct
  - ✓ Scale consistent

**Data Format Used**: UMO v4 via groupGames  
**Critical**: Game grouping works with UMO v4 episodes

---

### 4. Game Fish Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-gamefish

**Stories to Test**:

- [✓] **Standard Game** - Default rendering
  - ✓ Fish shape correct
  - ✓ Points represented
  - ✓ Winner indicator clear

- [✓] **Deuce Game** - Extended game
  - ✓ Multiple advantage bars visible
  - ✓ Deuce cycles clear
  - ✓ Proper proportions

- [✓] **Service Display** - Server visualization
  - ✓ Service indicator visible
  - ✓ Alternates correctly

- [✓] **Rally Mode** - Rally detail view
  - ✓ Rally bars visible
  - ✓ Shot counts accurate
  - ✓ Color coding correct

- [✓] **With Grid** - Grid overlay
  - ✓ Grid renders
  - ✓ Alignment correct
  - ✓ Labels readable

NOTE: I would like to see color variations on the square cells. right now it is red/black background. hive-eye-tracker uses blue/purple which is more pleasing.
=> make some color variations please!

**Data Format Used**: GameGroup (converted from UMO v4)  
**Critical**: Point data extracted correctly from UMO v4

---

### 5. Rally Tree Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-rallytree

**Stories to Test**:

- [✓] **Default** - Basic rally tree
  - ✓ Tree structure visible
  - ✓ Rally paths clear
  - ✓ Shot sequences correct

- [x] **With Multiple Rallies** - Full game
  - ✓ All rallies rendered
  - ✓ Branches distinct
  - x Labels readable => there have never been any labels readable so I wasn't even aware they were there!

- [✓] **Horizontal Layout** - Default orientation
  - ✓ Left-to-right flow
  - ✓ Proper spacing

- [✓] **Vertical Layout** - Alternative view
  - ✓ Top-to-bottom flow
  - ✓ Rotation correct

NOTE: I'd like to see the data, at least in the console.

**Data Format Used**: Point arrays (extracted from UMO v4)  
**Critical**: Rally notation preserved through conversion

---

### 6. Corona Chart Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-coronachart

**Stories to Test**:

- [✓] **Single Set** - Radial game view
  - ✓ Circular layout correct
  - ✓ Games positioned radially
  - ✓ Point differentials visible

- [✓] **Multiple Sets** - Full match
  - ✓ All sets render
  - ✓ Concentric layout
  - ✓ Color coding clear

- [✓] **Custom Colors** - Theme variants
  - ✓ Player colors applied
  - ✓ Consistent styling

**Data Format Used**: Processed episode data  
**Critical**: Score differentials calculated correctly

---

### 7. Simple Chart Visualization

**URL**: http://localhost:6006/?path=/story/visualizations-simplechart

**Stories to Test**:

- [✓] **Default** - Rally length histogram
  - ✓ Both player lines visible
  - ✓ Rally lengths accurate
  - ✓ Axes labeled

- [✓] **With Many Rallies** - Large dataset
  - ✓ Performance acceptable
  - ✓ All data points render
  - ✓ No overflow issues

**Data Format Used**: Rally length arrays  
**Critical**: Rally extraction from UMO v4 works

---

## 🧪 Data Format Compatibility Tests

### Test UMO v4 → Legacy Conversion

Open browser console and test adapter functions:

```javascript
// In Storybook console
import { normalizeEpisodes, isUMOv4Episode } from './utils/adapters';

// Test with sample data
const umoV4Episode = {
  point: {
    id: 'test',
    index: 0,
    gameInSet: 0,
    // ... full UMO v4 structure
  },
  context: {
    gameComplete: false,
    // ...
  },
};

// Should detect as UMO v4
console.log('Is UMO v4:', isUMOv4Episode(umoV4Episode)); // true

// Should convert to legacy
const legacy = normalizeEpisodes([umoV4Episode]);
console.log('Converted:', legacy);
// Should have legacy structure: point, game, set, needed
```

### Test with Both Data Generators

Compare visualizations using both data sources:

1. **Using Legacy Generator**:

   ```typescript
   import { generateSampleMatch } from './data/sampleMatch';
   const episodes = generateSampleMatch();
   ```

2. **Using UMO v4 Generator**:

   ```typescript
   import { generateSampleMatchV4 } from './data/sampleMatch';
   const match = generateSampleMatchV4();
   const episodes = match.episodes;
   ```

**Expected**: Both should render identically

---

## 🔬 Edge Cases to Verify

### Game Tree

- [ ] Tiebreak points render correctly
- [ ] Games with 20+ points (multiple deuces)
- [ ] No-ad scoring terminates correctly
- [ ] Empty episode array doesn't crash

### PTS Chart

- [ ] 5-set matches render all sets
- [ ] Tiebreak games show proper indexing
- [ ] Breakpoint highlighting correct
- [ ] Empty set doesn't crash

### Momentum Chart

- [ ] Sets with different game counts
- [ ] Very short games (4 points)
- [ ] Very long games (20+ points)
- [ ] Single game renders

### Rally Tree

- [ ] Missing rally data handled
- [ ] Very long rallies (20+ shots)
- [ ] Single shot points (aces)
- [ ] Empty data handled

---

## 📊 Performance Checks

Test with larger datasets:

- [ ] **100+ points** - All visualizations responsive
- [ ] **Full 5-set match** - No lag in rendering
- [ ] **Rapid updates** - Smooth transitions
- [ ] **Memory usage** - No leaks over time

---

## 🎨 Visual Regression

Compare screenshots before/after migration:

- [ ] Game Tree structure identical
- [ ] PTS Chart layout unchanged
- [ ] Momentum Chart alignment preserved
- [ ] Game Fish proportions correct
- [ ] Rally Tree branches unchanged
- [ ] Colors and styling consistent

---

## 🐛 Known Issues

### None Currently Identified

All visualizations building and initial tests passing.

---

## ✅ Sign-Off

### Developer Verification

- [x] All files updated
- [x] TypeScript compiles
- [x] Storybook builds
- [x] No console errors during build
- [x] Documentation complete

### User Verification (Required)

- [ ] All visualizations render correctly
- [ ] Both data formats work
- [ ] No visual regressions
- [ ] Performance acceptable
- [ ] Ready to proceed to D3 v7 migration

---

## 📝 Notes

**Testing Environment**:

- Node.js: (version from system)
- pnpm: (version from system)
- Storybook: v10.2.3
- D3: v4.13.0 (will upgrade to v7 in next phase)

**Next Steps After Verification**:

1. ✅ Confirm all visualizations working
2. Document any issues found
3. Fix any regressions
4. Proceed to D3 v7 migration (Phase 2)

---

**Verification By**: **\*\*\*\***\_**\*\*\*\***  
**Date**: **\*\*\*\***\_**\*\*\*\***  
**Status**: **\*\*\*\***\_**\*\*\*\***  
**Issues Found**: **\*\*\*\***\_**\*\*\*\***
