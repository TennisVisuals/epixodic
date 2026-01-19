# Factory Format Migration Plan
## tennisvisuals-mobile → Factory Format Codes

**Branch**: `factory-migration` (sandbox)  
**Date**: January 16, 2026  
**Goal**: Replace ALL legacy UMO format codes with Factory matchUpFormatCode standards

---

## 🎯 Migration Goals

1. **Remove legacy format codes** from tennisvisuals-mobile entirely
2. **Adopt Factory format codes** (SET3-S:6/TB7, etc.)
3. **Update UMO integration** to use new format adapter
4. **Enable removal of legacy support** from UMO core
5. **Maintain all existing functionality** - zero breaking changes

---

## 📋 Current State Analysis

### UMO Integration

**Location**: `src/services/matchObject/umo.ts` (1,830 lines)  
**Type**: Embedded (not npm package)  
**Status**: Contains all legacy format definitions

### Legacy Format Codes Found

**Match Formats (11)**:
1. `3_6a_7` - Best of 3, standard
2. `3_6n_7` - Best of 3, no-ad
3. `3_4n_10` - Best of 3, short sets, supertiebreak
4. `1_4n_7` - Single short set
5. `3_6n_10` - Best of 3, no-ad, supertiebreak
6. `5_6a_7` - Best of 5, standard (US Open)
7. `5_6a_7_long` - Best of 5, long final set (Wimbledon classic)
8. `3_6a_7_long` - Best of 3, long final set
9. `1_8a_7` - 8-game pro set
10. `1_8n_7` - 8-game pro set, no-ad
11. `1_6a_7` - 6-game college set

**Set Formats (9)**:
1. `AdSetsTo6tb7` - Standard with advantage
2. `NoAdSetsTo6tb7` - No-ad
3. `NoAdSetsTo4tb7` - Short sets
4. `longSetTo6by2` - No tiebreak
5. `supertiebreak` - Match tiebreak
6. `pro10a12` - 10-game pro set
7. `pro8a7` - 8-game pro set
8. `NoAdPro8a7` - 8-game pro set, no-ad
9. `college6a7` - 6-game college doubles

**Game Formats (5)**:
1. `advantage` - Standard game
2. `noAdvantage` - No-ad game
3. `tiebreak7a` - Tiebreak to 7
4. `tiebreak10a` - Tiebreak to 10
5. `tiebreak12a` - Tiebreak to 12
6. `tiebreak9n` - Tiebreak to 9, golden point

### Usage Patterns

The legacy codes are used:
- In format definitions (line ~13-131)
- In format initialization (matchFormat, setFormat, gameFormat)
- Possibly in stored match data
- Possibly in UI dropdowns/selectors

---

## 🗺️ Migration Strategy

### Option A: Full UMO Integration (RECOMMENDED)

**Approach**: Link to updated UMO project, use FormatAdapter

**Pros**:
- Clean separation of concerns
- UMO becomes reusable module
- Future updates easier
- Already tested (865 tests!)

**Cons**:
- Need to set up linking process
- More initial setup work

**Steps**:
1. Build UMO for distribution
2. Link UMO to tennisvisuals-mobile
3. Replace embedded UMO with import
4. Replace all legacy codes with Factory codes
5. Test thoroughly

---

### Option B: Copy FormatAdapter Only

**Approach**: Copy formatConverter.ts and formatAdapter.ts into project

**Pros**:
- Simpler initial setup
- No linking required
- Self-contained

**Cons**:
- Code duplication
- Updates require manual sync
- Less clean architecture

**Steps**:
1. Copy formatConverter.ts and formatAdapter.ts
2. Add tods-competition-factory dependency
3. Replace legacy code references
4. Update embedded UMO to use adapter
5. Test thoroughly

---

## 📦 Recommended Approach: Option A with pnpm link

### Phase 1: Prepare UMO for Linking

**1. Add build configuration to UMO**
```json
// universal-match-object/package.json
{
  "name": "@tennisvisuals/universal-match-object",
  "version": "2.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./formats": {
      "import": "./dist/formatConverter.js",
      "types": "./dist/formatConverter.d.ts"
    },
    "./adapter": {
      "import": "./dist/formatAdapter.js",
      "types": "./dist/formatAdapter.d.ts"
    }
  },
  "scripts": {
    "build": "tsc --project tsconfig.build.json",
    "dev": "tsc --watch --project tsconfig.build.json"
  }
}
```

**2. Create tsconfig.build.json**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "test/**/*",
    "**/*.test.ts"
  ]
}
```

**3. Create src/index.ts (main export)**
```typescript
// Main UMO exports
export { default as umo } from './umo';

// Format system exports
export {
  parseFormat,
  convertLegacyToFactory,
  convertFactoryToLegacy,
  extractFormatProperties,
  areFormatsEquivalent,
  isFactoryFormat,
  isLegacyFormat,
  isValidFormat,
  stringifyFormat,
  getFormatDescription
} from './formatConverter';

export {
  FormatAdapter,
  createFormatAdapter,
  isCompatibleFormat
} from './formatAdapter';

// Type exports
export type { ParsedFormat, FormatProperties } from './formatConverter';
```

**4. Build UMO**
```bash
cd universal-match-object
pnpm build
```

**5. Link UMO globally**
```bash
cd universal-match-object
pnpm link --global
```

---

### Phase 2: Update tennisvisuals-mobile

**1. Add UMO dependency**
```bash
cd tennisvisuals-mobile
pnpm link --global @tennisvisuals/universal-match-object
```

**2. Add Factory dependency**
```bash
cd tennisvisuals-mobile
pnpm add tods-competition-factory
```

**3. Update imports in tennisvisuals-mobile**
```typescript
// OLD (embedded)
import { umo } from './services/matchObject/umo';

// NEW (linked package)
import { umo, FormatAdapter, convertLegacyToFactory } from '@tennisvisuals/universal-match-object';
```

**4. Create format migration helper**
```typescript
// src/services/matchObject/formatMigration.ts
import { convertLegacyToFactory } from '@tennisvisuals/universal-match-object';

// Map all legacy codes to Factory codes
export const LEGACY_TO_FACTORY: Record<string, string> = {
  // Match formats
  '3_6a_7': 'SET3-S:6/TB7',
  '3_6n_7': 'SET3-S:6NOAD/TB7',
  '3_4n_10': 'SET3-S:4NOAD/TB7-F:TB10',
  '1_4n_7': 'SET1-S:4NOAD/TB7@3',
  '3_6n_10': 'SET3-S:6NOAD/TB7-F:TB10',
  '5_6a_7': 'SET5-S:6/TB7',
  '5_6a_7_long': 'SET5-S:6/TB7-F:6',
  '3_6a_7_long': 'SET3-S:6/TB7-F:6',
  '1_8a_7': 'SET1-S:8/TB7',
  '1_8n_7': 'SET1-S:8NOAD/TB7',
  '1_6a_7': 'SET1-S:6NOAD/TB7',
  
  // Set formats (these might not be directly used in tennisvisuals-mobile)
  'AdSetsTo6tb7': 'S:6/TB7',
  'NoAdSetsTo6tb7': 'S:6NOAD/TB7',
  'NoAdSetsTo4tb7': 'S:4NOAD/TB7@3',
  'longSetTo6by2': 'S:6',
  'supertiebreak': 'S:TB10',
  'pro10a12': 'S:10NOAD/TB12',
  'pro8a7': 'S:8/TB7',
  'NoAdPro8a7': 'S:8NOAD/TB7',
  'college6a7': 'S:6NOAD/TB7'
};

export const FACTORY_TO_LEGACY: Record<string, string> = 
  Object.fromEntries(Object.entries(LEGACY_TO_FACTORY).map(([k, v]) => [v, k]));

/**
 * Migrate legacy format code to Factory format code
 */
export function migrateFormat(legacyCode: string): string {
  return LEGACY_TO_FACTORY[legacyCode] || convertLegacyToFactory(legacyCode) || legacyCode;
}

/**
 * Migrate stored match data from legacy to Factory formats
 */
export function migrateMatchData(matchData: any): any {
  if (!matchData) return matchData;
  
  const migrated = { ...matchData };
  
  // Update format code if present
  if (migrated.format && typeof migrated.format === 'string') {
    migrated.format = migrateFormat(migrated.format);
  }
  
  // Update any nested format references
  if (migrated.metadata?.format) {
    migrated.metadata.format = migrateFormat(migrated.metadata.format);
  }
  
  return migrated;
}
```

---

### Phase 3: Replace Legacy Format References

**Files to Update**:

1. **Remove embedded UMO** (`src/services/matchObject/umo.ts`)
   - Delete entire file (replaced by package import)

2. **Update format selectors** (find all UI components that show format dropdowns)
   ```typescript
   // OLD
   const formats = ['3_6a_7', '5_6a_7', '3_6n_10'];
   
   // NEW
   const formats = [
     { code: 'SET3-S:6/TB7', name: 'Standard Best of 3' },
     { code: 'SET5-S:6/TB7', name: 'Best of 5 (US Open)' },
     { code: 'SET3-S:6NOAD/TB7-F:TB10', name: 'Best of 3, Final Set Tiebreak' }
   ];
   ```

3. **Update match initialization**
   ```typescript
   // OLD
   const match = umo.Match({ type: '3_6a_7' });
   
   // NEW
   const match = umo.Match({ type: 'SET3-S:6/TB7' });
   ```

4. **Update stored match loading**
   ```typescript
   // Add migration on load
   function loadMatch(matchId: string) {
     const stored = localStorage.getItem(matchId);
     const matchData = JSON.parse(stored);
     
     // Migrate if legacy format
     const migrated = migrateMatchData(matchData);
     
     return umo.Match({ type: migrated.format });
   }
   ```

5. **Update any hardcoded format references**
   ```bash
   # Search for all legacy format code references
   cd tennisvisuals-mobile
   grep -r "3_6a_7\|5_6a_7\|3_6n_10" src/
   ```

---

## 🧪 Testing Strategy

### 1. Unit Tests

Create test file: `src/services/matchObject/formatMigration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { migrateFormat, migrateMatchData, LEGACY_TO_FACTORY } from './formatMigration';

describe('Format Migration', () => {
  describe('migrateFormat()', () => {
    it('should migrate all legacy match formats', () => {
      expect(migrateFormat('3_6a_7')).toBe('SET3-S:6/TB7');
      expect(migrateFormat('5_6a_7')).toBe('SET5-S:6/TB7');
      expect(migrateFormat('3_6n_10')).toBe('SET3-S:6NOAD/TB7-F:TB10');
    });
    
    it('should pass through Factory formats unchanged', () => {
      expect(migrateFormat('SET3-S:6/TB7')).toBe('SET3-S:6/TB7');
    });
    
    it('should handle unknown formats', () => {
      expect(migrateFormat('unknown')).toBe('unknown');
    });
  });
  
  describe('migrateMatchData()', () => {
    it('should migrate format in match data', () => {
      const legacy = { format: '3_6a_7', score: '6-4, 6-3' };
      const migrated = migrateMatchData(legacy);
      expect(migrated.format).toBe('SET3-S:6/TB7');
    });
  });
  
  describe('Format mappings', () => {
    it('should have bidirectional mapping for all formats', () => {
      Object.entries(LEGACY_TO_FACTORY).forEach(([legacy, factory]) => {
        expect(factory).toBeTruthy();
        expect(factory.startsWith('SET') || factory.startsWith('S:')).toBe(true);
      });
    });
  });
});
```

### 2. Integration Tests

Test actual match creation and scoring:

```typescript
describe('Match Integration with Factory Formats', () => {
  it('should create match with Factory format code', () => {
    const match = umo.Match({ type: 'SET3-S:6/TB7' });
    expect(match.format.type()).toBe('SET3-S:6/TB7');
  });
  
  it('should maintain scoring behavior', () => {
    const match = umo.Match({ type: 'SET3-S:6/TB7' });
    
    // Play a game
    match.addPoint(0); // Server wins
    match.addPoint(0);
    match.addPoint(0);
    match.addPoint(0);
    
    const score = match.score();
    expect(score.games).toBe('1-0');
  });
  
  it('should handle all legacy formats via migration', () => {
    const legacyFormats = ['3_6a_7', '5_6a_7', '3_6n_10'];
    
    legacyFormats.forEach(legacy => {
      const factory = migrateFormat(legacy);
      const match = umo.Match({ type: factory });
      expect(match.format.type()).toBe(factory);
    });
  });
});
```

### 3. E2E Tests

Test UI workflows:
- Create new match with format selection
- Load saved match (with migration)
- Score points and verify display
- Export/import match data

---

## 📊 Migration Checklist

### Pre-Migration

- [ ] Create factory-migration branch ✅
- [ ] Document current format usage
- [ ] Identify all files referencing legacy codes
- [ ] Create format mapping table
- [ ] Write migration tests

### UMO Setup

- [ ] Add build configuration to UMO
- [ ] Create TypeScript build setup
- [ ] Export formatConverter and formatAdapter
- [ ] Build UMO package
- [ ] Link UMO globally

### tennisvisuals-mobile Updates

- [ ] Link UMO package
- [ ] Add tods-competition-factory dependency
- [ ] Create formatMigration helper
- [ ] Update all format references
- [ ] Remove embedded UMO file
- [ ] Update format selectors in UI
- [ ] Add migration for stored matches
- [ ] Update tests

### Testing

- [ ] Unit tests for format migration
- [ ] Integration tests for match creation
- [ ] E2E tests for UI workflows
- [ ] Manual testing of all features
- [ ] Performance testing

### UMO Cleanup (After Migration)

- [ ] Remove legacy format definitions from UMO
- [ ] Remove legacy format converter reverse mapping
- [ ] Update UMO tests to use Factory codes only
- [ ] Update UMO documentation
- [ ] Bump UMO version to 3.0.0 (breaking change)

### Documentation

- [ ] Update README with Factory format codes
- [ ] Migration guide for future updates
- [ ] API documentation updates
- [ ] Changelog entries

---

## 🚀 Execution Plan

### Step 1: UMO Package Setup (30 min)

```bash
cd /Users/charlesallen/Development/GitHub/TennisVisuals/universal-match-object

# 1. Add build config
# (create package.json updates, tsconfig.build.json, src/index.ts)

# 2. Build package
pnpm build

# 3. Link globally
pnpm link --global
```

### Step 2: tennisvisuals-mobile Setup (15 min)

```bash
cd /Users/charlesallen/Development/GitHub/TennisVisuals/tennisvisuals-mobile

# 1. Link UMO
pnpm link --global @tennisvisuals/universal-match-object

# 2. Add Factory dependency
pnpm add tods-competition-factory

# 3. Verify link worked
pnpm list @tennisvisuals/universal-match-object
```

### Step 3: Create Migration Helper (30 min)

- Create `src/services/matchObject/formatMigration.ts`
- Add LEGACY_TO_FACTORY mapping
- Add migrateFormat() and migrateMatchData() functions
- Write unit tests

### Step 4: Update Format References (1-2 hours)

- Search for all legacy format code usage
- Replace with Factory codes
- Update UI dropdowns
- Add migration for stored data
- Remove embedded UMO file

### Step 5: Testing (1-2 hours)

- Run unit tests
- Run integration tests
- Manual testing of all features
- Fix any issues

### Step 6: UMO Cleanup (30 min)

- Remove legacy format definitions
- Update tests
- Bump version
- Document changes

---

## 🎯 Success Criteria

- [ ] All legacy format codes removed from tennisvisuals-mobile
- [ ] All functionality working with Factory codes
- [ ] All tests passing
- [ ] No breaking changes to user experience
- [ ] Performance maintained or improved
- [ ] UMO can remove legacy support safely

---

## 📝 Notes

**Backward Compatibility**:
- Stored matches may have legacy codes
- Migration function handles this automatically
- Users won't notice any difference

**Future Benefits**:
- Easy to add new formats (timed sets, etc.)
- Standard notation across projects
- Community-standard format codes
- Better integration with CourtHive ecosystem

**Rollback Plan**:
- Keep factory-migration branch separate
- Don't merge until fully tested
- Can revert to main branch if issues

---

## 🔄 Next Actions

1. **Immediate**: Set up UMO build and linking
2. **Today**: Create migration helper and tests
3. **Tomorrow**: Update all format references
4. **Week 1**: Complete testing and refinement
5. **Week 2**: UMO cleanup and documentation

---

**Status**: Ready to begin  
**Branch**: factory-migration  
**Estimated Time**: 4-6 hours total  
**Risk Level**: Low (sandbox branch, comprehensive testing)

*This document will be updated as migration progresses.*
