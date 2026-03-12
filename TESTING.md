# Testing Checklist — March 2026 Changes

## Changes Summary
1. **Competition-factory-server**: Removed tracker module (umo.ts, tracker.gateway, trackerMessages, saveMatchPoints, getMatchStats, tracker config)
2. **Epixodic baseApi**: Server URL now reads `VITE_SERVER_URL` env var
3. **Epixodic factoryApi**: `getScheduledMatchUps()` wraps params matching courthive-public pattern
4. **Epixodic scheduledMatchUps store**: New Svelte store for scheduled matchUp data
5. **Score relay microservice**: New `score-relay/` package with Socket.IO fan-out
6. **Epixodic scoreRelay client**: New client connector for tracker/listener connections

---

## Automated Tests

### Score Relay Unit + Integration Tests
```bash
cd epixodic/score-relay
pnpm test
```

Tests cover:
- `matchStore.test.ts` — updateMatch, setMatchHistory, getActiveMatchIds, removeMatch, pruneStaleMatches
- `relay.test.ts` — full Socket.IO integration: tracker ack, validation, listener subscribe/unsubscribe, fan-out, late-join state, multi-listener broadcast

### Score Relay Manual E2E Test
```bash
# Terminal 1: start the relay
cd epixodic/score-relay
pnpm dev

# Terminal 2: run the manual test script
cd epixodic/score-relay
npx tsx test-manual.ts
```

Tests: client connections, score fan-out, late-join, unsubscribe, history, validation.

### Existing Epixodic Tests (should still pass)
```bash
cd epixodic
pnpm test
```

---

## Manual Testing

### 1. Competition-Factory-Server — Tracker Removal

**Goal**: Verify the server starts and runs correctly without the tracker module.

```bash
cd competition-factory-server    # (in CourtHive/)
pnpm start:dev
```

- [ ] Server starts without errors
- [ ] No import/module errors related to tracker
- [ ] TMX WebSocket gateway still works (connect to `/tmx` namespace)
- [ ] `POST /factory/scheduledmatchups` still responds correctly
- [ ] Other factory routes unaffected

**Verify no references remain**:
```bash
cd competition-factory-server
grep -r "TrackerModule\|TrackerGateway\|trackerMessages\|umo\b" src/ --include="*.ts" | grep -v node_modules
# Should return nothing
```

### 2. Epixodic — Base URL Configuration

**Goal**: Verify the server URL is configurable via env var.

**Test with default fallback**:
- [ ] Remove or comment out `VITE_SERVER_URL` from `.env.local`
- [ ] Run `pnpm start`
- [ ] Open browser DevTools → Network tab
- [ ] Trigger any API call (load a tournament)
- [ ] Verify requests go to `http://localhost:8383`

**Test with custom URL**:
- [ ] Set `VITE_SERVER_URL=http://localhost:3333` in `.env.local`
- [ ] Restart `pnpm start`
- [ ] Verify requests go to `http://localhost:3333`

### 3. Epixodic — Scheduled MatchUps

**Goal**: Verify the scheduledMatchUps API call works with the factory server.

**Prerequisites**: Competition-factory-server running with a loaded tournament.

```bash
# In browser console (with epixodic running):
const { getScheduledMatchUps } = await import('/src/svelte/services/factoryApi.ts');
const result = await getScheduledMatchUps('<your-tournament-id>');
console.log(result);
```

- [ ] No network errors (check DevTools → Network)
- [ ] Request body structure is `{ params: { tournamentId, usePublishState: true, hydrateParticipants: true } }`
- [ ] Response contains `dateMatchUps`, `completedMatchUps`, etc.
- [ ] Passing additional options merges them: `getScheduledMatchUps(id, { nextMatchUps: true })`

### 4. Score Relay — Health Check

```bash
cd epixodic/score-relay
pnpm dev
# In another terminal:
curl http://localhost:8384
```

- [ ] Returns `{"status":"ok","service":"score-relay"}`

### 5. Score Relay — Persistence to Factory Server

**Goal**: Verify that history events are forwarded to the factory server when configured.

```bash
# Start relay with persistence enabled
FACTORY_SERVER_URL=http://localhost:8383 pnpm dev
```

- [ ] Startup log shows: `[relay] persistence enabled → http://localhost:8383`
- [ ] When a tracker sends a `history` event, the relay POSTs to the factory server
- [ ] If factory server is down, relay logs error but doesn't crash

```bash
# Start relay without persistence
pnpm dev
```

- [ ] Startup log shows: `[relay] persistence disabled`

### 6. Score Relay — Browser Integration

**Goal**: Verify the epixodic client connector works.

```bash
# Terminal 1: start relay
cd epixodic/score-relay && pnpm dev

# Terminal 2: start epixodic
cd epixodic && pnpm start
```

In browser console:
```javascript
// Connect as listener
const { subscribeToAll, sendScore, connectTracker } = await import('/src/services/messaging/scoreRelay.ts');

// Subscribe to all scores
const unsub = subscribeToAll(
  (update) => console.log('SCORE:', update),
  (activeIds) => console.log('ACTIVE:', activeIds)
);

// Connect tracker and send a test score
connectTracker();
sendScore({
  matchUpId: 'browser-test-1',
  score: { scoreStringSide1: '15-0' }
});
```

- [ ] Console shows `[scoreRelay] tracker connected`
- [ ] Console shows `[scoreRelay] listener connected`
- [ ] Console shows `SCORE: { matchUpId: 'browser-test-1', ... }`
- [ ] Relay terminal shows tracker and live connections

```javascript
// Cleanup
unsub();
const { disconnectAll } = await import('/src/services/messaging/scoreRelay.ts');
disconnectAll();
```

### 7. Type Checking

```bash
# Score relay
cd epixodic/score-relay && npx tsc --noEmit

# Epixodic (should pass with the new files)
cd epixodic && pnpm check-types

# Factory server
cd competition-factory-server && npx tsc --noEmit
```

- [ ] All three compile without errors

### 8. Logo SVG (previous change, regression check)

- [ ] Open `epixodic/index.html` in browser
- [ ] Logo renders correctly in light mode
- [ ] Toggle to dark mode (`document.documentElement.setAttribute('data-theme', 'dark')`)
- [ ] Logo colors change to dark mode palette
- [ ] No artifacts or missing segments
