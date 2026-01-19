# Legacy Format Cleanup Plan
## Complete Removal of Legacy Format System

**Goal**: Remove ALL legacy format code after migration complete  
**Scope**: Both tennisvisuals-mobile AND universal-match-object  
**Result**: Clean codebase using only Factory format standards

---

## 🎯 Strategy: Migration → Cleanup

### Phase 1: Migration (tennisvisuals-mobile) ✅ 60% Complete
Get tennisvisuals-mobile working with Factory formats **only**

### Phase 2: Cleanup (Both Repos) ⬜ Pending
Remove ALL legacy format code from both projects

---

## 📋 Cleanup Checklist

### tennisvisuals-mobile Cleanup

**Goal**: Zero legacy format references

#### 1. Remove Embedded UMO ⬜
```bash
# Delete the entire embedded UMO file
rm src/services/matchObject/umo.ts
```

**Reason**: Using linked package instead

---

#### 2. Remove Migration Helper (After Transition Period) ⬜
```bash
# Once all stored matches are migrated, remove:
rm src/services/matchObject/formatMigration.ts
rm src/services/matchObject/formatMigration.test.ts
```

**Reason**: No longer need legacy → factory conversion

**Timeline**: Keep for 1-2 releases to handle old stored matches, then remove

---

#### 3. Update All Imports ⬜
```typescript
// REMOVE (embedded)
import { mo } from '../services/matchObject/umo';

// REPLACE WITH (linked package)
import { Match } from '@tennisvisuals/universal-match-object/formats';
```

**Files to Update**:
- src/transition/env.ts
- src/transition/displayFormats.ts
- Any other files importing from umo.ts

---

#### 4. Update Format References ⬜
Replace any remaining hardcoded legacy format strings:

```typescript
// REMOVE
const format = '3_6a_7';

// REPLACE WITH
const format = 'SET3-S:6/TB7';
```

**Search Pattern**:
```bash
grep -r "3_6a_7\|5_6a_7\|3_6n_10" src/
```

---

#### 5. Update UI Format Selectors ⬜
```typescript
// REMOVE legacy dropdown
const formats = ['3_6a_7', '5_6a_7', '3_6n_10'];

// REPLACE WITH Factory formats
const formats = [
  { code: 'SET3-S:6/TB7', name: 'Standard Best of 3' },
  { code: 'SET5-S:6/TB7', name: 'Best of 5' },
  { code: 'SET3-S:6NOAD/TB7-F:TB10', name: 'Best of 3 with Tiebreak' }
];
```

---

### universal-match-object Cleanup

**Goal**: Zero legacy format support

#### 1. Remove Legacy Format Definitions ⬜
```typescript
// DELETE from src/matchObject.ts (or wherever they live)
const formats = {
  matches: {
    '3_6a_7': { ... },    // DELETE
    '3_6n_7': { ... },    // DELETE
    '5_6a_7': { ... },    // DELETE
    // ... all legacy match formats
  },
  sets: {
    'AdSetsTo6tb7': { ... },  // DELETE
    'NoAdSetsTo6tb7': { ... }, // DELETE
    // ... all legacy set formats
  },
  games: {
    'advantage': { ... },     // DELETE
    'noAdvantage': { ... },   // DELETE
    // ... all legacy game formats
  }
};
```

**Impact**: ~300+ lines removed

---

#### 2. Remove Legacy Converter Functions ⬜
```typescript
// DELETE from src/formatConverter.ts
export const LEGACY_TO_FACTORY_MAP = { ... };  // DELETE
export const FACTORY_TO_LEGACY_MAP = { ... };  // DELETE

export function convertLegacyToFactory() { ... }  // DELETE
export function convertFactoryToLegacy() { ... }  // DELETE
```

**Keep**: Only Factory format functions

**Impact**: ~150 lines removed

---

#### 3. Simplify FormatAdapter ⬜
```typescript
// REMOVE legacy code path from constructor
constructor(formatCode: string) {
  // DELETE this check
  const parsed = parseFormat(formatCode);
  this.isLegacy = parsed.type === 'legacy';  // DELETE
  
  // Only accept Factory formats
  const parsed = matchUpFormatCode.parse(formatCode);
  if (!parsed) throw new Error(`Invalid Factory format: ${formatCode}`);
  
  this.factoryFormat = parsed;
  this.formatCode = formatCode;
}

// REMOVE these methods
getLegacyCode() { ... }      // DELETE
isLegacyFormat() { ... }     // DELETE
```

**Impact**: ~50 lines removed, simpler interface

---

#### 4. Update All Tests ⬜

**Phase 1 Tests** (413 tests) - DELETE entirely
```bash
rm -rf test/formats/definitions.test.ts     # 151 tests - DELETE
rm -rf test/formats/behavior.test.ts        # 71 tests - DELETE
rm -rf test/formats/parsing.test.ts         # 61 tests - DELETE
rm -rf test/formats/scenarios.test.ts       # 29 tests - DELETE
rm -rf test/formats/edge-cases.test.ts      # 48 tests - DELETE
rm -rf test/formats/metadata.test.ts        # 44 tests - DELETE
```

**Reason**: These test legacy formats we're removing

---

**Phase 2 Tests** (215 tests) - UPDATE
```bash
# Update to remove legacy code paths
test/factory/parse.test.ts           # Keep, already Factory-only
test/factory/mapping.test.ts         # DELETE (legacy mapping)
test/factory/stringify.test.ts       # Keep, already Factory-only
test/factory/compatibility.test.ts   # DELETE (legacy compat)
test/factory/adapter.test.ts         # UPDATE (remove legacy tests)
```

---

**Phase 3 Tests** (173 tests) - UPDATE
```bash
test/regression/replay.test.ts       # UPDATE (remove legacy)
test/regression/validation.test.ts   # UPDATE (remove legacy)
```

---

**Result**: ~300-400 tests removed, rest updated to Factory-only

---

#### 5. Update Documentation ⬜
```bash
# Update all docs to show Factory formats only
EXECUTIVE_SUMMARY.md
FACTORY_INTEGRATION_PLAN.md
TEST_SUITE_PLAN.md
GETTING_STARTED.md
README.md (if exists)
```

**Remove**: All references to legacy format codes  
**Replace**: With Factory format examples

---

#### 6. Update Package Version ⬜
```json
// package.json
{
  "name": "@tennisvisuals/universal-match-object",
  "version": "3.0.0",  // BREAKING CHANGE
  "description": "Universal Match Object with Factory matchUpFormatCode"
}
```

**Changelog**:
```markdown
## 3.0.0 - BREAKING CHANGES

### Removed
- All legacy format code support (3_6a_7, etc.)
- Legacy format definitions
- Legacy converter functions (convertLegacyToFactory, etc.)
- Backward compatibility layer

### Changed
- FormatAdapter now accepts ONLY Factory format codes
- All tests updated to use Factory formats
- Simplified API (removed legacy methods)

### Migration Guide
Use formatMigration helper to convert any stored legacy codes
before upgrading to v3.0.0
```

---

## 🗑️ Files to Delete

### tennisvisuals-mobile
```bash
# Immediate (after migration working)
src/services/matchObject/umo.ts                    # 1,830 lines

# Later (after transition period)
src/services/matchObject/formatMigration.ts        # 300 lines
src/services/matchObject/formatMigration.test.ts   # 210 lines
```

**Total Deletion**: ~2,340 lines

---

### universal-match-object
```bash
# Test files (legacy tests)
test/formats/definitions.test.ts       # 151 tests
test/formats/behavior.test.ts          # 71 tests
test/formats/parsing.test.ts           # 61 tests
test/formats/scenarios.test.ts         # 29 tests
test/formats/edge-cases.test.ts        # 48 tests
test/formats/metadata.test.ts          # 44 tests
test/factory/mapping.test.ts           # 36 tests (legacy mapping)
test/factory/compatibility.test.ts     # 70 tests (legacy compat)

# Documentation
DISCOVERED_ISSUES.md                   # No longer relevant
SESSION_*_SUMMARY.md                   # Archive or delete
```

**Total Deletion**: ~500 test files + legacy code sections

---

## 📊 Impact Analysis

### Code Reduction

| Repository | Lines Removed | % Reduction |
|------------|---------------|-------------|
| tennisvisuals-mobile | ~2,340 | ~15% |
| universal-match-object | ~1,500+ | ~20% |
| **Total** | **~3,840** | **~17%** |

### Test Suite Changes

| Phase | Before | After | Change |
|-------|--------|-------|--------|
| Phase 1 (Legacy) | 413 | 0 | -413 ❌ |
| Phase 2 (Factory) | 215 | ~150 | -65 ⬇️ |
| Phase 3 (Regression) | 173 | ~120 | -53 ⬇️ |
| **Total** | **865** | **~270** | **-595** |

### Benefits

✅ **Simpler codebase** - 17% code reduction  
✅ **Faster tests** - 69% fewer tests to maintain  
✅ **Clearer API** - No dual-format confusion  
✅ **Modern standards** - Factory formats only  
✅ **Future-proof** - Ready for new formats (timed sets, etc.)  
✅ **Easier maintenance** - One format system to support  

---

## ⚠️ Important Considerations

### 1. Stored Match Data

**Problem**: Users may have matches saved with legacy format codes

**Solution Options**:

**Option A: Auto-migrate on load (RECOMMENDED)**
```typescript
// Keep formatMigration.ts for 1-2 releases
function loadMatch(matchId: string) {
  const data = JSON.parse(localStorage.getItem(matchId));
  return migrateMatchData(data); // Auto-convert legacy → factory
}
```

**Option B: One-time migration script**
```typescript
// Run once to migrate all stored matches
function migrateAllMatches() {
  const archive = JSON.parse(localStorage.getItem('match_archive') || '[]');
  archive.forEach(matchId => {
    const data = JSON.parse(localStorage.getItem(matchId));
    const migrated = migrateMatchData(data);
    localStorage.setItem(matchId, JSON.stringify(migrated));
  });
}
```

**Recommendation**: Use Option A for 2-3 releases, then remove migration code

---

### 2. External Dependencies

**Question**: Does anything else depend on UMO?

**Answer** (from user): NO
- Only tennisvisuals-mobile uses UMO
- Safe to make breaking changes

---

### 3. Timeline

**Conservative Approach**:
```
Week 1: Complete migration (tennisvisuals-mobile working with Factory)
Week 2: Test thoroughly, deploy to staging
Week 3: Deploy to production
Week 4: Keep migration helper for safety
Week 5-6: Monitor for issues
Week 7: Remove legacy code (if no issues)
Week 8: Release UMO v3.0.0 (Factory-only)
```

**Aggressive Approach**:
```
Day 1-2: Complete migration
Day 3: Test thoroughly
Day 4: Deploy and monitor
Day 5-7: Remove legacy code from both repos
Day 8: Release UMO v3.0.0
```

**Recommendation**: Conservative for production, aggressive for development

---

## 🚀 Cleanup Execution Plan

### Step 1: Finish Migration (tennisvisuals-mobile)
```bash
cd tennisvisuals-mobile

# 1. Update imports to use linked package
# 2. Update format references to Factory codes
# 3. Test thoroughly
# 4. Commit to factory-migration branch
```

**When**: Now (continue current work)

---

### Step 2: Deploy and Monitor
```bash
# Deploy factory-migration branch to test environment
# Monitor for issues
# Get user feedback
```

**When**: After Step 1 complete

---

### Step 3: Remove Embedded UMO (tennisvisuals-mobile)
```bash
cd tennisvisuals-mobile
git rm src/services/matchObject/umo.ts
git commit -m "feat: Remove embedded UMO, use linked package"
```

**When**: After Step 2 validates it's working

---

### Step 4: Remove Legacy Code (UMO)
```bash
cd universal-match-object

# Remove legacy format definitions
# Remove legacy tests
# Update remaining tests
# Simplify formatAdapter
# Update docs
# Bump to v3.0.0

git commit -m "BREAKING: Remove all legacy format support - v3.0.0"
```

**When**: After Step 3 merged to main

---

### Step 5: Remove Migration Helper (tennisvisuals-mobile)
```bash
cd tennisvisuals-mobile

# After 1-2 releases, when confident all stored matches migrated
git rm src/services/matchObject/formatMigration.ts
git rm src/services/matchObject/formatMigration.test.ts
git commit -m "cleanup: Remove migration helper (no longer needed)"
```

**When**: 1-2 releases after Step 4

---

## ✅ Success Criteria

### tennisvisuals-mobile
- [ ] Zero references to legacy format codes
- [ ] No embedded UMO file
- [ ] All imports from @tennisvisuals/universal-match-object
- [ ] All stored matches auto-migrate
- [ ] All features working
- [ ] Clean codebase

### universal-match-object
- [ ] Zero legacy format definitions
- [ ] Zero legacy converter code
- [ ] All tests use Factory formats
- [ ] Docs updated
- [ ] Version 3.0.0 released
- [ ] ~40% code reduction achieved

---

## 🎯 Final State

### tennisvisuals-mobile
```typescript
// Clean imports
import { Match } from '@tennisvisuals/universal-match-object';
import { matchUpFormatCode } from '@tennisvisuals/universal-match-object/formats';

// Factory formats only
const match = new Match({ format: 'SET3-S:6/TB7' });

// No legacy code anywhere
```

### universal-match-object
```typescript
// Simple, clean API
export { FormatAdapter } from './formatAdapter';
export { matchUpFormatCode } from 'tods-competition-factory';

// Factory formats only
const adapter = new FormatAdapter('SET3-S:6/TB7');
```

---

## 📝 Summary

**Migration**: Get it working with Factory formats  
**Cleanup**: Remove ALL legacy code  
**Result**: Clean, modern codebase

**Timeline**: 1-2 weeks for conservative approach  
**Impact**: ~3,840 lines deleted, 17% code reduction  
**Risk**: Low (no other dependencies, comprehensive testing)

---

**Status**: Ready to execute after migration complete  
**Branch Strategy**: factory-migration → main → cleanup  
**Final Version**: tennisvisuals-mobile (current), UMO v3.0.0

*This is a one-way door: Once cleaned up, no going back to legacy formats.*
