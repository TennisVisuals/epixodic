# D3 Visualization Migration Notes

## D3 v3 → v4 Migration ✅ COMPLETE!

Both legacy visualizations have been successfully migrated from D3 v3 to v4:

### 1. coronaChart.ts ✅ MIGRATED

**Completed Migrations:**
- ✅ `d3.svg.line.radial()` → `d3.radialLine()`
- ✅ `d3.svg.area.radial()` → `d3.radialArea()`
- ✅ `d3.scale.linear()` → `d3.scaleLinear()`
- ✅ `.interpolate('basis')` → `.curve(d3.curveBasis)`
- ✅ Event handlers updated for D3 v4 (`function(event, d)`)
- ✅ Converted from JavaScript to TypeScript
- ✅ Added type safety and interfaces

**Migration Example:**
```typescript
// OLD (D3 v3 - JavaScript)
var line = d3.svg.line.radial()
  .interpolate("basis")
  .radius(radius)
  .angle(angle);

// NEW (D3 v4 - TypeScript) ✅
const line = d3.radialLine<number>()
  .curve(d3.curveBasis)
  .radius((d) => radius(d))
  .angle((d, i) => angle(offset + i));
```

**Status:** Fully working with D3 v4, TypeScript, and Storybook!

### 2. RallyTree.ts ✅ MIGRATED

**Completed Migrations:**
- ✅ `d3.scale.linear()` → `d3.scaleLinear()`
- ✅ `d3.svg.area()` → `d3.area()`
- ✅ `.interpolate()` → `.curve()`
- ✅ Event handlers updated for D3 v4
- ✅ Converted from JavaScript to TypeScript
- ✅ Added comprehensive type definitions
- ✅ Preserved all layout algorithm logic

**Migration Example:**
```typescript
// OLD (D3 v3 - JavaScript)
var xScale = d3.scale.linear()
  .domain([0, max])
  .range([0, width]);

var area = d3.svg.area()
  .interpolate('linear')
  .x(function(d, i) { return xScale(d) });

// NEW (D3 v4 - TypeScript) ✅
const xScale = d3.scaleLinear()
  .domain([0, max])
  .range([0, width]);

const area = d3.area<number>()
  .curve(d3.curveLinear)
  .x((d, i) => xScale(d));
```

**Status:** Fully working with D3 v4, TypeScript, and Storybook!

## D3 v4 → v7 Future Upgrade

When upgrading to D3 v7 (latest), consider:

### Breaking Changes
1. **Module imports**: D3 v7 is ESM-only
   ```javascript
   // Current (v4)
   import * as d3 from 'd3';
   
   // Future (v7) - more granular
   import { select, scaleLinear, line } from 'd3';
   ```

2. **Selection.join()**: New method for enter-update-exit pattern
   ```javascript
   // Current (v4)
   const circles = svg.selectAll('circle').data(data);
   circles.exit().remove();
   circles.enter().append('circle').merge(circles)
     .attr('r', 5);
   
   // Future (v7)
   svg.selectAll('circle')
     .data(data)
     .join('circle')
     .attr('r', 5);
   ```

3. **Event handling**: New event listener syntax
   ```javascript
   // Current (v4)
   selection.on('click', function(d, i) { ... });
   
   // Future (v7)
   selection.on('click', (event, d) => { ... });
   ```

### Migration Strategy
1. Fix coronaChart and RallyTree to work with v4 first
2. Test all visualizations thoroughly
3. Create feature branch for v7 upgrade
4. Update one visualization at a time
5. Maintain backward compatibility via adapters if needed

## Current D3 API Usage Audit

### Working Visualizations (D3 v4 Compatible)

#### simpleChart.ts
- ✅ `d3.scaleLinear()`
- ✅ `d3.line()`
- ✅ `d3.axisBottom()`, `d3.axisLeft()`

#### gameFish.ts
- ✅ `d3.scaleLinear()`, `d3.scaleBand()`
- ✅ Selection methods
- ✅ Transitions

#### gameTree.ts
- ✅ `d3.scaleLinear()`, `d3.scaleOrdinal()`
- ✅ Path generation
- ✅ Gradients

#### momentumChart.ts
- ✅ Uses gameFish (which is v4 compatible)
- ✅ Scale functions
- ✅ Selection methods

#### ptsChart.ts
- ✅ `d3.scaleLinear()`, `d3.scaleBand()`
- ✅ Complex data binding
- ✅ Gradients and patterns

### All Migrated! ✅

#### coronaChart.ts ✅
- ✅ `d3.svg.line.radial()` → `d3.radialLine()`
- ✅ `d3.scale.linear()` → `d3.scaleLinear()`
- ✅ `.interpolate()` → `.curve()`
- ✅ TypeScript conversion

#### RallyTree.ts ✅
- ✅ `d3.scale.linear()` → `d3.scaleLinear()`
- ✅ `d3.svg.area()` → `d3.area()`
- ✅ `.interpolate()` → `.curve()`
- ✅ Event handlers updated
- ✅ TypeScript conversion

## Testing Checklist

After migration, verify:
- [x] All visualizations render correctly ✅
- [x] Interactive features work (hover, click) ✅
- [x] Transitions are smooth ✅
- [x] Responsive behavior works ✅
- [x] Edge cases handled (empty data, tiebreaks, etc.) ✅
- [x] Performance is acceptable ✅
- [x] No console errors/warnings ✅
- [x] TypeScript types are correct ✅
- [x] Storybook builds successfully ✅

## Resources

- [D3 v3 → v4 Migration Guide](https://github.com/d3/d3/blob/main/CHANGES.md#changes-in-d3-40)
- [D3 v6 Migration Guide](https://observablehq.com/@d3/d3v6-migration-guide)
- [D3 v7 Release Notes](https://github.com/d3/d3/releases/tag/v7.0.0)
