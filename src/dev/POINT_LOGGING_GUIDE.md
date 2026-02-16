# Point Decoration Logging Guide

**Purpose:** Capture all point metadata/decorations that hive-eye submits to UMO for building the v4 statistics engine.

---

## Setup

1. **Build and run hive-eye:**

   ```bash
   cd hive-eye-tracker
   pnpm build
   pnpm start  # or open in browser
   ```

2. **Open browser console** (F12 or Cmd+Option+I)

3. **You should see:**
   ```
   📊 Point Logger initialized. Available commands:
     window.exportPointLogs() - Export and download logs
     window.pointLogger.clear() - Clear logs
     window.pointLogger.disable() - Disable logging
     window.pointLogger.enable() - Enable logging
   ```

---

## Capturing Point Decorations

### Goal

Play through a complete match using **all possible point types** to capture the full range of metadata decorations.

### Point Types to Include

#### 1. **Service Points**

- ✅ Ace (1st serve)
- ✅ Ace (2nd serve)
- ✅ Double fault
- ✅ Serve winner (1st serve)
- ✅ Serve winner (2nd serve)
- ✅ Normal rally after 1st serve in
- ✅ Normal rally after 2nd serve in

#### 2. **Rally Outcomes**

- ✅ Winner (forehand)
- ✅ Winner (backhand)
- ✅ Winner (volley)
- ✅ Winner (overhead/smash)
- ✅ Unforced error (forehand)
- ✅ Unforced error (backhand)
- ✅ Unforced error (net)
- ✅ Unforced error (out)
- ✅ Forced error
- ✅ Net (ball in net)
- ✅ Out (ball out)

#### 3. **Stroke Types**

- ✅ Forehand groundstroke
- ✅ Backhand groundstroke
- ✅ Forehand volley
- ✅ Backhand volley
- ✅ Overhead/smash
- ✅ Drop shot
- ✅ Lob
- ✅ Slice

#### 4. **Special Situations**

- ✅ Breakpoints
- ✅ Game points
- ✅ Set points
- ✅ Match points
- ✅ Tiebreaks
- ✅ Let calls
- ✅ Code violations/penalties (if available)

#### 5. **Rally Tracking** (if enabled)

- ✅ Short rally (1-3 shots)
- ✅ Medium rally (4-9 shots)
- ✅ Long rally (10+ shots)

#### 6. **Location Tracking** (if enabled)

- ✅ Serve locations (Wide, Body, T)
- ✅ Shot locations on court

---

## During Play

### What You'll See in Console

Every time you add a point, you'll see output like:

```
📊 Point decoration: {
  "winner": 0,
  "code": "S",
  "result": "Ace",
  "timestamp": 1705771234567
}
```

```
📊 Point decoration: {
  "winner": 1,
  "result": "Unforced Error",
  "stroke": "Forehand",
  "hand": "Forehand",
  "rally": [...],
  "timestamp": 1705771245678
}
```

### Tips for Complete Coverage

1. **Play methodically** - Try to hit each point type at least 2-3 times
2. **Use keyboard shortcuts** - Faster than clicking
3. **Check console** - Make sure decorations look varied
4. **Play 2-3 sets** - More data = better patterns

---

## Exporting Logs

### When Done Playing

1. **Run in console:**

   ```javascript
   window.exportPointLogs();
   ```

2. **This will:**
   - Print summary to console
   - Auto-download `point-decorations.json`

### What Gets Exported

```json
{
  "logs": [
    {
      "winner": 0,
      "code": "S",
      "result": "Ace",
      "timestamp": 1705771234567
    },
    {
      "winner": 1,
      "result": "Unforced Error",
      "stroke": "Forehand",
      "hand": "Forehand",
      "timestamp": 1705771245678
    }
    // ... all points
  ],
  "summary": {
    "results": ["Ace", "Winner", "Unforced Error", "Forced Error", "Double Fault"],
    "strokes": ["Forehand", "Backhand", "Volley", "Overhead"],
    "hands": ["Forehand", "Backhand"],
    "locations": ["Wide", "Body", "T"],
    "codes": ["S", "R", "D"],
    "totalPoints": 87,
    "fields": {
      "winner": 87,
      "result": 85,
      "stroke": 42,
      "hand": 40,
      "code": 87,
      "rally": 12
    }
  },
  "stats": {
    "byResult": {
      "Ace": 12,
      "Winner": 25,
      "Unforced Error": 18,
      "Forced Error": 10,
      "Double Fault": 8,
      "Out": 7,
      "Net": 7
    },
    "byStroke": {
      "Forehand": 22,
      "Backhand": 15,
      "Volley": 5
    },
    "breakpoints": 6
  }
}
```

---

## Analyzing the Data

### Key Questions We're Answering

1. **What fields exist?**
   - Check `summary.fields` for all populated fields

2. **What are the possible values?**
   - `summary.results` - All result types
   - `summary.strokes` - All stroke types
   - `summary.hands` - All hand types
   - `summary.locations` - All location types
   - `summary.codes` - All point codes

3. **How often is each field populated?**
   - `summary.fields` shows count for each field
   - If `result` = 87 and `totalPoints` = 87, then result is always present
   - If `stroke` = 42 and `totalPoints` = 87, then stroke is optional (48% coverage)

4. **What's the relationship between fields?**
   - Look at actual point objects in `logs` array
   - Example: Do aces have `stroke`? (probably not)
   - Example: Do unforced errors always have `hand`? (maybe)

---

## Additional Logging Commands

### Clear and Restart

```javascript
window.pointLogger.clear();
// Play more points
window.exportPointLogs();
```

### Disable During Load

```javascript
// Disable logging
window.pointLogger.disable();

// Load a saved match (won't log old points)
// ... load match ...

// Re-enable for new points
window.pointLogger.enable();
```

### Check Current Logs

```javascript
window.pointLogger.export();
```

---

## Troubleshooting

### Not Seeing Console Output?

- Check console filter (should allow all messages)
- Make sure you're on the right tab
- Refresh page and check for initialization message

### Download Not Working?

- Check browser download permissions
- Try manually copying from console: `window.pointLogger.export()`

### Want to Log More Matches?

```javascript
// Export first match
window.exportPointLogs();

// Clear
window.pointLogger.clear();

// Start new match
// ... play ...

// Export second match with different filename
window.pointLogger.download('match-2.json');
```

---

## Next Steps

Once you have the JSON file:

1. **Share it** - Send `point-decorations.json` to development team
2. **Analyze** - Review the summary section for patterns
3. **Design** - Use schema to design TypeScript interfaces
4. **Implement** - Build v4 statistics engine with proper types

---

## What We're Looking For

### Critical Fields (Must Have)

- ✅ `winner` - Who won the point (0 or 1)
- ✅ `result` - How the point ended
- ✅ `server` - Who served (derive from match state if not present)

### Important Fields (Statistics)

- ✅ `stroke` - Type of shot (forehand, backhand, etc.)
- ✅ `hand` - Hand used
- ✅ `serve` - 1st or 2nd serve
- ✅ `breakpoint` - Was it a breakpoint?

### Optional Fields (Enhanced Stats)

- ⚠️ `rally` - Shot sequence
- ⚠️ `location` - Court position
- ⚠️ `code` - UMO point code

The more complete your match coverage, the better our statistics engine will be! 🎾📊
