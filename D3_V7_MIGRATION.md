# D3 v7 Migration Plan

**Date**: 2026-02-01  
**Status**: Ready to Begin  
**Prerequisites**: ✅ UMO v4 migration complete, ✅ Rally bars working

---

## Executive Summary

Upgrade all 8 standalone visualizations from D3 v4 to D3 v7. UMO v4 migration is already complete, so this focuses purely on the D3 upgrade.

**Estimated Effort**: 40-50 hours (5-6 weeks)

---

## Why D3 v7?

- **Modern ES6 modules**: Tree-shaking reduces bundle size
- **Better TypeScript support**: Improved type definitions
- **Performance improvements**: Faster rendering, better memory usage
- **Simplified API**: `.join()` replaces `.enter().append().merge()`
- **Active maintenance**: v4 is EOL, v7 has ongoing support

---

## Current State

### Visualization Inventory

| Visualization | Lines | Complexity | D3 Patterns              | Est. Hours |
| ------------- | ----- | ---------- | ------------------------ | ---------- |
| simpleChart   | ~200  | Low        | Basic bars               | 4          |
| coronaChart   | ~400  | Medium     | Radial paths             | 6          |
| RallyTree     | ~300  | Medium     | Tree layout              | 6          |
| gameTree      | ~500  | Medium     | Gradients, paths         | 6          |
| gameChart     | ~400  | Medium     | Bars, lines              | 6          |
| gameFish      | ~800  | High       | Grid, cells, complex     | 8          |
| momentumChart | ~600  | High       | Multiple gameFish        | 6          |
| ptsChart      | ~1200 | High       | Nested charts, gradients | 8          |

**Total**: ~4400 lines, **50 hours estimated**

---

## Key D3 API Changes

### 1. Imports

```typescript
// OLD (D3 v4)
import * as d3 from 'd3';
d3.select('#chart');

// NEW (D3 v7)
import { select, scaleLinear, line } from 'd3';
select('#chart');
```

### 2. Enter/Update/Exit Pattern

```typescript
// OLD (D3 v4)
const circles = svg.selectAll('circle').data(data);
circles.exit().remove();
circles.enter().append('circle').merge(circles).attr('r', 5);

// NEW (D3 v7) - Simple
svg.selectAll('circle').data(data).join('circle').attr('r', 5);

// NEW (D3 v7) - With transitions
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
```

### 3. Event Handlers

```typescript
// OLD (D3 v4)
.on('click', function(d, i) {
  const event = d3.event;  // ❌
  const [x, y] = d3.mouse(this);  // ❌
})

// NEW (D3 v7)
import { pointer } from 'd3';
.on('click', function(event, d) {  // ✅ event first
  const [x, y] = pointer(event);  // ✅
})
```

### 4. Removed Utilities

Use native JavaScript instead:

```typescript
// OLD              // NEW
d3.keys(obj)    → Object.keys(obj)
d3.values(obj)  → Object.values(obj)
d3.entries(obj) → Object.entries(obj)
d3.map(arr)     → arr.map() or new Map()
d3.set(arr)     → new Set(arr)
```

---

## Migration Strategy

### Phase 0: Setup (30 minutes)

1. **Install D3 v7 as alias**:

   ```bash
   pnpm add d3-v7@npm:d3@^7.9.0
   ```

2. **Verify both versions**:

   ```bash
   pnpm list d3      # Should show 4.13.0
   pnpm list d3-v7   # Should show 7.9.0
   ```

3. **Keep both versions** until all migrations complete

### Approach: Side-by-Side Migration

1. Keep original `{viz}.ts` (D3 v4)
2. Create new `{viz}-v7.ts` (D3 v7)
3. Update imports in stories to test both
4. When v7 verified identical, replace original
5. Remove `-v7` suffix

**Benefits**:

- ✅ Zero risk - can compare outputs
- ✅ Easy rollback
- ✅ Can test both versions simultaneously
- ✅ Clear migration progress

---

## Per-Visualization Checklist

For each visualization:

### 1. Code Changes (2-4 hours)

- [ ] Create `{viz}-v7.ts` copy
- [ ] Update imports to named imports from `d3-v7`
- [ ] Replace all `.enter().append().merge()` with `.join()`
- [ ] Update event handlers: `d3.event` → `event` parameter
- [ ] Replace `d3.mouse()` with `pointer(event)`
- [ ] Replace D3 utilities with native JS
- [ ] Save merged selections (like we fixed for gradients!)

### 2. Testing (1-2 hours)

- [ ] Side-by-side comparison with v4 version
- [ ] Visual output identical
- [ ] All interactions work (hover, click)
- [ ] All transitions smooth
- [ ] Test with various data scenarios
- [ ] Check browser console for errors

### 3. Documentation (30 min)

- [ ] Update any code comments
- [ ] Note any behavioral changes
- [ ] Update stories if needed

---

## Migration Order

### Week 1: Simple Visualizations (12 hours)

1. **simpleChart** (4 hours) - Proof of concept
2. **coronaChart** (4 hours)
3. **RallyTree** (4 hours)

### Week 2: Medium Complexity (12 hours)

4. **gameTree** (6 hours) - Already has gradient fix!
5. **gameChart** (6 hours)

### Week 3: High Complexity (16 hours)

6. **gameFish** (8 hours) - Most complex
7. **momentumChart** (4 hours) - Uses gameFish
8. **ptsChart** (4 hours) - Rally bars working!

### Week 4: Integration & Cleanup (6 hours)

- Replace all `-v7` files with originals
- Remove D3 v4 from package.json
- Update all imports to use `d3` (no `-v7` suffix)
- Final testing

**Total**: ~46 hours over 4 weeks

---

## Critical Lessons Learned (from Rally Bar Fix)

### Gradient Selection Pattern

```typescript
// ❌ WRONG - selecting from empty selection
const gradients = svg.selectAll('.gradient').data(data);
gradients.enter().append('linearGradient').merge(gradients);
const stops = gradients.selectAll('stop')...  // Empty!

// ✅ CORRECT - save merged selection
const gradientsData = svg.selectAll('.gradient').data(data);
const gradients = gradientsData.enter()
  .append('linearGradient')
  .merge(gradientsData);
const stops = gradients.selectAll('stop')...  // Works!
```

### Key Insight

Always save the **merged selection** and use it for subsequent operations. This is critical for nested selections like gradients → stops.

---

## Testing Strategy

### Visual Regression Tests

For each visualization:

1. Render v4 version, take screenshot
2. Render v7 version, take screenshot
3. Compare pixel-by-pixel (allow <0.1% difference)
4. Document any differences

### Functional Tests

- [ ] All configuration options work
- [ ] All event handlers fire correctly
- [ ] Transitions are smooth (60fps)
- [ ] No console errors or warnings
- [ ] Responsive behavior correct

### Performance Tests

- [ ] Initial render time comparable
- [ ] Update render time comparable
- [ ] Memory usage stable
- [ ] Bundle size reduced (tree-shaking)

---

## Risk Assessment

### Low Risk Factors

- ✅ UMO v4 already complete (data layer stable)
- ✅ Side-by-side approach (can compare outputs)
- ✅ Can keep v4 as fallback
- ✅ Rally bar fix taught us gradient patterns
- ✅ Small, incremental changes

### Potential Issues

- ⚠️ Subtle rendering differences (test carefully)
- ⚠️ Event handling edge cases
- ⚠️ Transition timing differences

### Mitigation

- Visual regression tests
- Side-by-side comparison
- Thorough testing of all features
- Keep v4 available for rollback

---

## Success Criteria

### Technical

- [ ] All 8 visualizations using D3 v7
- [ ] Visual output identical to v4 versions
- [ ] All interactions working correctly
- [ ] No TypeScript errors
- [ ] Bundle size reduced

### Performance

- [ ] Initial render ≤ v4 performance
- [ ] Update render ≤ v4 performance
- [ ] 60fps maintained for animations
- [ ] Memory usage stable

### Code Quality

- [ ] Named imports throughout
- [ ] Consistent `.join()` pattern
- [ ] No D3 v4 code remaining
- [ ] All linting rules passing

---

## Rollback Plan

If critical issues discovered:

1. Keep `-v7` files separate
2. Revert imports back to v4
3. Continue using D3 v4
4. Fix issues in v7 versions
5. Retry migration later

No breaking changes to data or API - purely D3 upgrade.

---

## Next Steps

### This Week (Week 1)

1. ✅ Rally bars working (DONE!)
2. [ ] Install D3 v7: `pnpm add d3-v7@npm:d3@^7.9.0`
3. [ ] Migrate simpleChart (proof of concept)
4. [ ] Migrate coronaChart
5. [ ] Migrate RallyTree

### Status Check (End of Week 1)

- Review learnings from first 3 migrations
- Adjust timeline if needed
- Proceed with medium complexity visualizations

---

## Questions / Notes

- Bundle size reduction estimate: Should see 20-30% reduction with tree-shaking
- Performance improvement estimate: 5-10% faster rendering
- TypeScript improvements: Better autocomplete and type safety

---

**Ready to begin!** Start with simpleChart as proof of concept, then proceed systematically through all visualizations.
