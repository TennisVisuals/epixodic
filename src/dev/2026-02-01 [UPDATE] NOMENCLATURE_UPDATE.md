# Nomenclature Update: match → matchUp

**Date**: February 1, 2026  
**Status**: ✅ COMPLETE  
**Reason**: Align with Tennis Open Data Standards (TODS)

---

## Executive Summary

Updated all UMO v4 data model code to use `matchUp` instead of `match` to:

1. Align with TODS nomenclature
2. Disambiguate from `match()` functions that check equality
3. Maintain consistency with CourtHive/factory ecosystem

---

## Changes Made

### Type Definitions (`types/UMOv4.ts`)

**Interfaces Renamed**:

- `MatchFormat` → `MatchUpFormat`
- `MatchState` → `MatchUpState`
- `UMOv4Match` → `UMOv4MatchUp`

**Fields Renamed**:

- `matchId` → `matchUpId`
- `format` → `matchUpFormat` (in UMOv4MatchUp)
- `matchComplete` → `matchUpComplete`
- `matchWinner` → `matchUpWinner`
- `matchpoint` → `matchUpPoint`

**Comments Updated**:

- "Match-wide" → "MatchUp-wide" (in point indexing comments)
- "Sets won in match" → "Sets won in matchUp"
- All other match references updated

### Data Generators

**sampleMatch.ts**:

- `generateSampleMatchV4()` → `generateSampleMatchUpV4()`
- Returns `UMOv4MatchUp` instead of `UMOv4Match`
- All property names updated (`matchUpId`, `matchUpFormat`, etc.)
- All `matchpoint` fields → `matchUpPoint`
- All `matchComplete` → `matchUpComplete`
- All `matchWinner` → `matchUpWinner`

**sampleGame.ts**:

- All `matchpoint` → `matchUpPoint`
- All `matchComplete` → `matchUpComplete`
- All `matchWinner` → `matchUpWinner`

**sampleGames.ts**:

- All `matchpoint` → `matchUpPoint`
- All `matchComplete` → `matchUpComplete`
- All `matchWinner` → `matchUpWinner`

### Additional Improvements

#### Rally Length Distribution

Updated `generateRally()` in sampleMatch.ts to use realistic distribution:

- **Short rallies (2-5 shots)**: 60% - Most common
- **Medium rallies (6-10 shots)**: 30%
- **Long rallies (11-15 shots)**: 10% - Rare

This creates more realistic data for RallyTree visualization.

#### Color Variations (gameFish)

Added 3 new color-themed stories to gameFish:

- **CustomColorsBlue**: Purple/Blue theme (like hive-eye-tracker)
- **CustomColorsTeal**: Teal/Orange theme (fresh, vibrant)
- **CustomColorsGreen**: Green/Red theme (classic sports)

Addresses user feedback requesting more pleasing color variations beyond red/black.

---

## TODS Alignment

### Why "matchUp"?

**Tennis Open Data Standards (TODS)** uses `matchUp` instead of `match`:

1. **Disambiguation**:
   - `match` is an overloaded term in code (equality checking, regex matching)
   - `matchUp` is unambiguous - clearly refers to a tennis competition

2. **Consistency**:
   - CourtHive/factory uses `matchUp` throughout
   - Universal Match Object should align with TODS
   - Easier integration with factory ecosystem

3. **Clarity**:
   - `matchUpFormat` clearly describes the matchUp's format
   - `matchUpPoint` clearly means "point that ends the matchUp"
   - No confusion with other uses of "match"

### TODS Participants Structure

Note: Type definitions also support TODS participant structure:

```typescript
// SINGLES
participants: [{
  participantId: 'p1',
  participantName: 'Player One',
  participantType: 'INDIVIDUAL',
  person: { personId, standardFamilyName, standardGivenName }
}]

// DOUBLES
participants: [{
  participantId: 'team1',
  participantName: 'Team One',
  participantType: 'PAIR',
  individualParticipants: [
    { participantId: 'p1', person: {...} },
    { participantId: 'p2', person: {...} }
  ]
}]
```

---

## Files Changed

### Type Definitions (1)

- `src/visualizations/standalone/types/UMOv4.ts`

### Data Generators (3)

- `src/visualizations/standalone/data/sampleMatch.ts`
- `src/visualizations/standalone/data/sampleGame.ts`
- `src/visualizations/standalone/data/sampleGames.ts`

### Stories (1)

- `src/visualizations/standalone/gameFish.stories.ts` (added color variations)

### Documentation (1)

- `NOMENCLATURE_UPDATE.md` (this file)

---

## Breaking Changes

### For External Users

**Function Name Change**:

```typescript
// OLD
import { generateSampleMatchV4 } from './data/sampleMatch';
const match = generateSampleMatchV4();

// NEW
import { generateSampleMatchUpV4 } from './data/sampleMatch';
const matchUp = generateSampleMatchUpV4();
```

**Type Name Changes**:

```typescript
// OLD
import type { UMOv4Match, MatchFormat, MatchState } from './types/UMOv4';

// NEW
import type { UMOv4MatchUp, MatchUpFormat, MatchUpState } from './types/UMOv4';
```

**Property Name Changes**:

```typescript
// OLD
const match: UMOv4Match = {
  matchId: '123',
  format: {...},
  state: {
    complete: match.state.matchComplete,
    winner: match.state.matchWinner
  }
};

// NEW
const matchUp: UMOv4MatchUp = {
  matchUpId: '123',
  matchUpFormat: {...},
  state: {
    complete: matchUp.state.matchUpComplete,
    winner: matchUp.state.matchUpWinner
  }
};
```

**Episode Property Changes**:

```typescript
// OLD
episode.point.matchpoint;
episode.context.matchComplete;
episode.context.matchWinner;

// NEW
episode.point.matchUpPoint;
episode.context.matchUpComplete;
episode.context.matchUpWinner;
```

### For Internal Visualizations

**No breaking changes** - Visualizations use adapters that convert to legacy format internally.

---

## Backward Compatibility

### Legacy Episode Format - UNCHANGED

The legacy Episode format used by visualizations is **unchanged**:

```typescript
interface Episode {
  point: { ... },
  game: { ... },
  set: { ... },
  needed: { ... }
}
```

Visualizations continue to work with this format via adapters.

### Adapter Layer - UPDATED

Adapters handle UMO v4 → Legacy conversion transparently:

```typescript
// Adapter automatically handles new property names
function umoV4ToLegacy(umo: UMOv4Episode): Episode {
  return {
    point: { ... },
    game: { complete: umo.context.gameComplete, ... },
    set: { complete: umo.context.setComplete, ... },
    needed: { ... }
  };
}
```

No changes required to adapter - it reads from the new UMO v4 structure automatically.

---

## User Feedback Addressed

### 1. Nomenclature (DONE ✅)

- [x] Updated all `match` → `matchUp` for TODS alignment
- [x] Disambiguates from `match()` functions
- [x] Consistent with CourtHive/factory

### 2. gameFish Colors (DONE ✅)

- [x] Added Blue/Purple theme (like hive-eye-tracker)
- [x] Added Teal/Orange theme
- [x] Added Green/Red theme
- [x] All with rally display and grid

### 3. Rally Distribution (DONE ✅)

- [x] Updated `generateRally()` with realistic distribution
- [x] Short rallies (2-5): 60%
- [x] Medium rallies (6-10): 30%
- [x] Long rallies (11-15): 10%
- [x] Should reduce/eliminate empty rows in RallyTree

### 4. No-Ad Scoring Note

- User noted 40-15 → Game progression is correct
- No-ad scoring was working as designed before migration
- No changes needed

---

## Testing

### Build Status: ✅ PASSING

```
Storybook build completed successfully
✓ 690 modules transformed
✓ All TypeScript compiles
✓ No errors or warnings
```

### Manual Testing Required

- [ ] Verify `generateSampleMatchUpV4()` works
- [ ] Verify new color themes in gameFish
- [ ] Verify rally distribution improves RallyTree
- [ ] Check that all nomenclature is consistent

---

## Next Steps

### Immediate

1. User re-verification in Storybook
2. Test new color themes
3. Verify rally distribution
4. Check RallyTree for empty rows

### Future

1. Update documentation with matchUp nomenclature
2. Update examples in README
3. Update migration docs
4. Proceed to D3 v7 migration

---

## Documentation Updates Needed

Files that reference "match" and need updates:

- [ ] `DATA_MODEL_MIGRATION.md`
- [ ] `VERIFICATION_CHECKLIST.md`
- [ ] `UMO_V4_DATA_MIGRATION_COMPLETE.md`
- [ ] `README.md` (if it has examples)
- [ ] `MIGRATION_PLAN.md` (future reference)

---

## Summary

✅ All code updated to use `matchUp` nomenclature  
✅ TODS-aligned naming throughout  
✅ Color variations added to gameFish  
✅ Realistic rally distribution implemented  
✅ Build successful  
✅ Ready for re-verification

**Breaking Changes**: Function and type names changed, but adapters maintain backward compatibility for visualizations.

**User Impact**: Minimal - main impact is on data generator usage and type imports.

---

**Status**: Complete and ready for user re-verification  
**Build**: Passing  
**Next**: User testing in Storybook
