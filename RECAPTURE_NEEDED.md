# Recapture Needed - Updated Logger

**Date:** January 20, 2026  
**Reason:** Logger now captures enriched point data with explicit winner

---

## What Changed

### Before (Issue)
Logger captured **raw input** before UMO processing:
```javascript
pointLogger.log(point);  // BEFORE addPoint
env.match.addPoint(point);
```

**Problem:** Code-only points had no winner:
```json
{ "code": "A" }  // Ace - winner unclear!
{ "code": "D" }  // Double fault - winner unclear!
```

### After (Fixed)
Logger now captures **enriched output** after UMO processing:
```javascript
const what = env.match.addPoint(point);
pointLogger.log(what.point);  // AFTER addPoint - has winner!
```

**Benefit:** All points now have explicit winner:
```json
{
  "code": "A",
  "winner": 0,  // ← Now explicit!
  "server": 0,
  "score": "15-0"
}
```

---

## Why This Matters

### Before (Ambiguous)
- Had to derive winner from code + server context
- Required match state tracking
- Error-prone

### After (Explicit)
- ✅ Winner always present
- ✅ Self-contained data
- ✅ No ambiguity
- ✅ Easier to implement statistics

---

## Action Required

**Please recapture point decorations:**

1. **Pull latest code:**
   ```bash
   cd hive-eye-tracker
   git pull origin feature/umo-4.0
   pnpm build
   pnpm start
   ```

2. **Clear old logs:**
   ```javascript
   window.pointLogger.clear()
   ```

3. **Play another match** (same coverage as before)
   - Aces
   - Double faults
   - Winners
   - Errors (forced and unforced)
   - Various rally lengths

4. **Export:**
   ```javascript
   window.exportPointLogs()
   ```

5. **Replace file:**
   - New file will download as `point-decorations.json`
   - Place in: `universal-match-object/examples/test-data/point-decorations.json`
   - Overwrite the old one

---

## What You'll See (New Data)

### Old Format (Code-Only)
```json
{
  "code": "A",
  "timestamp": 1768945266347
}
```

### New Format (Enriched)
```json
{
  "code": "A",
  "winner": 0,       // ← Explicit!
  "server": 0,       // ← Added by UMO
  "score": "15-0",   // ← Score at time
  "set": 0,          // ← Current set
  "game": 0,         // ← Current game
  "index": 0,        // ← Point index
  "timestamp": 1768945266347
}
```

Much better! 🎾

---

## Timeline Impact

**Minimal:** Should take ~5 minutes
- Build: 30 seconds
- Play match: 3-4 minutes
- Export: 10 seconds

**Benefit:** Much cleaner statistics implementation
- No winner derivation logic needed
- No server tracking required
- Simpler, more robust code

---

## Thank You!

This improvement will make the statistics engine much cleaner and more reliable. Appreciate the quick recapture! 🙏
