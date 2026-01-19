# MUID → matchUpId Migration Plan

**Goal:** Replace legacy `muid` with TODS-standard `matchUpId` throughout hive-eye-tracker

**Status:** Planning Phase

---

## Current State Analysis

### muid Usage by File (6 files total)

#### 1. ❌ **modalShare.ts** - DELETE ENTIRE FILE
**Status:** Unused, will not be reimplemented

**Actions:**
- Delete `src/transition/modalShare.ts`
- Remove import from `registerEvents.ts` line 16
- Remove event registration from `registerEvents.ts` line 47

---

#### 2. ✅ **storageAdapter.ts** - KEEP (Legacy Converter Only)
**Current Usage:**
```typescript
Line 267: matchUpId: legacyData.match?.muid || matchId
```

**Action:** ✅ NO CHANGE NEEDED
- This is in `convertLegacyToV3()` function
- Correctly reads legacy `muid` and converts to `matchUpId`
- This is exactly where legacy support should remain

---

#### 3. 🔧 **factoryMatchUpLoader.ts** - FIX
**Current Usage:**
```typescript
Line 97: muid: matchUp.matchUpId,
```

**Problem:** Maps `matchUpId` to legacy `muid` field

**Action:** CHANGE to use TODS property
```typescript
// BEFORE:
env.match.metadata.defineMatch({
  muid: matchUp.matchUpId,
  status: matchUp.matchUpStatus,
});

// AFTER:
env.match.metadata.defineMatch({
  matchUpId: matchUp.matchUpId,
  status: matchUp.matchUpStatus,
});
```

---

#### 4. 🔧 **loadMatch.ts** - PARTIAL FIX
**Current Usage:**
```typescript
Line 27-28: const isLegacyStorage = match_data.muid && !match_data.matchUpId;
Line 43-46: if (!match_data.match.muid) {
              match_data.match.muid = UUID();
              browserStorage.remove(match_id);
            }
            env.match.metadata.defineMatch(match_data.match);
```

**Actions:**
1. ✅ Line 27-28: KEEP (correctly detects legacy storage)
2. 🔧 Line 43-46: KEEP but only execute for legacy format

**Rationale:** 
- Line 27-28 is the legacy detection guard - must stay
- Line 43-46 should only run inside `if (isLegacyStorage)` block

**Change:**
```typescript
// BEFORE:
if (match_data.match) {
  if (!match_data.match.muid) {
    match_data.match.muid = UUID();
    browserStorage.remove(match_id);
  }
  env.match.metadata.defineMatch(match_data.match);
}

// AFTER:
if (match_data.match) {
  if (isLegacyStorage) {
    // Only add muid for legacy format
    if (!match_data.match.muid) {
      match_data.match.muid = UUID();
      browserStorage.remove(match_id);
    }
  }
  env.match.metadata.defineMatch(match_data.match);
}
```

---

#### 5. 🔧 **displayMatchArchive.ts** - MAJOR REFACTOR
**Current Usage:**
```typescript
Line 62:  const muid = p?.getAttribute('muid');
Line 65:  return loadMatch(muid);
Line 74:  modalExport(muid);
Line 77:  deleteMatch(muid);
Line 90:  const data: any = { muid: match_id }; // Commented out code
Line 108: export function resetMatch(muid?: string) {
Line 122-124: 
          muid = muid || UUID();
          env.match.metadata.defineMatch({ muid, date });
          browserStorage.set('current_match', muid);
Line 148-149: const isTODSFormat = match_data.matchUpId && !match_data.muid;
Line 186: <div id='match_${match_id}' muid='${match_id}' class='flexcenter...'>
```

**Actions:**

1. **HTML Attribute** (Line 186):
   ```html
   <!-- BEFORE -->
   <div id='match_${match_id}' muid='${match_id}' class='flexcenter...'>
   
   <!-- AFTER -->
   <div id='match_${match_id}' data-match-id='${match_id}' class='flexcenter...'>
   ```

2. **Event Handler** (Lines 62, 65, 74, 77):
   ```typescript
   // BEFORE:
   const muid = p?.getAttribute('muid');
   return loadMatch(muid);
   modalExport(muid);
   deleteMatch(muid);
   
   // AFTER:
   const matchId = p?.getAttribute('data-match-id');
   return loadMatch(matchId);
   modalExport(matchId);
   deleteMatch(matchId);
   ```

3. **Delete commented code** (Line 90):
   ```typescript
   // DELETE this entire commented block - uses legacy muid
   ```

4. **resetMatch function** (Lines 108-126):
   ```typescript
   // BEFORE:
   export function resetMatch(muid?: string) {
     env.match.reset();
     // ...
     muid = muid || UUID();
     env.match.metadata.defineMatch({ muid, date });
     browserStorage.set('current_match', muid);
     stateChangeEvent();
   }
   
   // AFTER:
   export function resetMatch(matchUpId?: string) {
     env.match.reset();
     // ...
     matchUpId = matchUpId || UUID();
     env.match.metadata.defineMatch({ matchUpId, date });
     browserStorage.set('current_match', matchUpId);
     stateChangeEvent();
   }
   ```

5. ✅ **Format Detection** (Lines 148-149): KEEP
   ```typescript
   // This correctly detects legacy vs TODS format
   const isTODSFormat = match_data.matchUpId && !match_data.muid;
   ```

---

#### 6. 🔧 **coms.ts** - FIX
**Current Usage:**
```typescript
Line 90:  matchUpId: match.muid,
Line 94:  if (match.muid) coms.socket.emit('mh', { type: 'history', payload });
Line 119: resetMatch(auth_match.match.muid);
Line 229: const muid = env.match.metadata.defineMatch().muid;
Line 230: const data: any = { muid, status };
```

**Actions:**

1. **Lines 90, 94** - Use matchUpId directly:
   ```typescript
   // BEFORE:
   matchUpId: match.muid,
   if (match.muid) coms.socket.emit(...)
   
   // AFTER:
   matchUpId: match.matchUpId,
   if (match.matchUpId) coms.socket.emit(...)
   ```

2. **Line 119** - Handle legacy vs TODS:
   ```typescript
   // BEFORE:
   resetMatch(auth_match.match.muid);
   
   // AFTER:
   // Support both legacy and TODS format from server
   const matchId = auth_match.match.matchUpId || auth_match.match.muid;
   resetMatch(matchId);
   ```

3. **Lines 229-230** - Use matchUpId:
   ```typescript
   // BEFORE:
   const muid = env.match.metadata.defineMatch().muid;
   const data: any = { muid, status };
   
   // AFTER:
   const matchUpId = env.match.metadata.defineMatch().matchUpId;
   const data: any = { matchUpId, status };
   ```

---

## Implementation Order

### Phase 1: Delete Unused File ✅
1. Delete `src/transition/modalShare.ts`
2. Remove imports and registrations from `registerEvents.ts`
3. Build and verify

### Phase 2: Simple Replacements
1. **factoryMatchUpLoader.ts** - Change `muid` to `matchUpId` in defineMatch
2. **coms.ts** - Replace all `muid` with `matchUpId` (except line 119 which needs fallback)
3. Build and verify

### Phase 3: displayMatchArchive.ts Refactor
1. Change HTML attribute from `muid` to `data-match-id`
2. Update event handlers to use `data-match-id`
3. Rename `resetMatch(muid)` parameter to `matchUpId`
4. Update all calls to `resetMatch()`
5. Delete commented code
6. Build and verify

### Phase 4: loadMatch.ts Guard Fix
1. Move muid creation inside `isLegacyStorage` block
2. Build and verify

### Phase 5: Testing
1. Test new match creation (should use matchUpId)
2. Test loading legacy matches (should still work via converter)
3. Test loading TODS matches (should use matchUpId)
4. Test match archive display
5. Test exporting matches
6. Test broadcasting (if enabled)

---

## Verification Checklist

After migration:
- [ ] New matches use `matchUpId` throughout
- [ ] Legacy matches still load correctly (via storageAdapter conversion)
- [ ] Match archive displays correctly
- [ ] Export functionality works
- [ ] Broadcasting uses `matchUpId` (not `muid`)
- [ ] No TypeScript errors
- [ ] App builds successfully
- [ ] Grep confirms no `muid` except in legacy converter:
  ```bash
  grep -r "muid" src/ | grep -v "storageAdapter.ts" | grep -v "loadMatch.ts.*isLegacyStorage"
  # Should return: 0 matches (or only comments/detection guards)
  ```

---

## Expected File Count After Migration

- **Files with muid:** 2 files
  - `storageAdapter.ts` - Legacy converter only
  - `loadMatch.ts` - Legacy detection guard only
  
- **Files without muid:** Everything else uses `matchUpId`

---

## Risks & Mitigation

### Risk 1: Breaking Legacy Match Loading
**Mitigation:** Keep legacy detection and conversion in place
- `storageAdapter.ts` conversion stays unchanged
- `loadMatch.ts` detection guard stays unchanged

### Risk 2: Server/Broadcasting Still Expects muid
**Mitigation:** Check coms.ts socket.emit calls
- If server expects `muid`, might need to keep property name in socket payloads
- Or update server to accept `matchUpId`

### Risk 3: Stored Matches in Browser Storage
**Mitigation:** Auto-conversion already implemented
- Legacy matches with `muid` will be detected by `isLegacyStorage`
- Converter in `storageAdapter.ts` handles the migration

---

## Related Files (No muid usage, but related)

These files don't use muid but are part of the match lifecycle:
- `env.ts` - Match initialization
- `displayUpdate.ts` - Match display
- `viewManager.ts` - View routing
- `matchStorage.ts` - Storage helpers

---

**Created:** 2026-01-19  
**Status:** Ready for implementation  
**Estimated Effort:** 1-2 hours
