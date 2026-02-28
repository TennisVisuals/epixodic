/**
 * Server tracking tests
 *
 * These tests simulate the scoring flow triggered by UI clicks:
 *   changeServer() → classAction(Ace) → stateChangeEvent() → updateState()
 *
 * Rather than mounting DOM elements, we exercise the same ScoringEngine calls
 * that the event handlers make and verify that `getNextServer()` (which drives
 * `swapServer()` / `resetButtons()` display updates) returns the correct side.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { scoreGovernor } from 'tods-competition-factory';

const { ScoringEngine } = scoreGovernor;

type Side = 0 | 1;
type PointOpts = { winner: Side; result?: string };

// Mirror the client's getNextServer() from src/state/env.ts
function getNextServer(engine: InstanceType<typeof ScoringEngine>, clientServing: Side): Side {
  const points = engine.getState().history?.points || [];
  if (points.length === 0) return clientServing;
  return engine.getNextServer();
}

// Helper: simulate what classAction does for each point action
function addPointAsClient(engine: InstanceType<typeof ScoringEngine>, serving: Side, opts: PointOpts) {
  engine.addPoint({ ...opts, server: serving } as any);
}

describe('Server tracking — switch to player 2', () => {
  let engine: InstanceType<typeof ScoringEngine>;
  let serving: Side;

  beforeEach(() => {
    engine = new ScoringEngine({ matchUpFormat: 'SET3-S:6/TB7' });
    serving = 0; // default server
  });

  // Simulate: changeServer() sets serving = 1
  function changeServer() {
    serving = (1 - serving) as Side;
  }

  // Simulate: after addPoint, stateChangeEvent → updateState checks getNextServer
  function syncServerFromEngine() {
    const nextServer = getNextServer(engine, serving);
    if (nextServer !== serving) {
      serving = nextServer;
    }
  }

  it('server stays on player 2 mid-game after switching and scoring an Ace', () => {
    // User clicks "switch server" before any points
    changeServer();
    expect(serving).toBe(1);

    // User clicks "Ace" — classAction passes server: env.serving
    addPointAsClient(engine, serving, { winner: 1, result: 'Ace' });

    // stateChangeEvent → updateState → getNextServer
    syncServerFromEngine();

    // Server should still be player 2 (mid-game)
    expect(serving).toBe(1);
  });

  it('server stays on player 2 through entire first game', () => {
    changeServer();
    expect(serving).toBe(1);

    // Score 3 points (15-0, 30-0, 40-0) — all Aces by player 2
    for (let i = 0; i < 3; i++) {
      addPointAsClient(engine, serving, { winner: 1, result: 'Ace' });
      syncServerFromEngine();
      expect(serving).toBe(1); // still mid-game, player 2 serves
    }
  });

  it('server alternates to player 1 after player 2 wins first game', () => {
    changeServer();

    // Player 2 wins a love game (4 aces)
    for (let i = 0; i < 4; i++) {
      addPointAsClient(engine, serving, { winner: 1, result: 'Ace' });
      syncServerFromEngine();
    }

    // After game complete, server should switch to player 1
    expect(serving).toBe(0);
  });

  it('server returns to player 2 for third game', () => {
    changeServer();

    // Game 1: player 2 serves, wins love game
    for (let i = 0; i < 4; i++) {
      addPointAsClient(engine, serving, { winner: 1, result: 'Ace' });
      syncServerFromEngine();
    }
    expect(serving).toBe(0);

    // Game 2: player 1 serves, wins love game
    for (let i = 0; i < 4; i++) {
      addPointAsClient(engine, serving, { winner: 0 });
      syncServerFromEngine();
    }
    expect(serving).toBe(1); // back to player 2

    // Game 3: player 2 serves again
    addPointAsClient(engine, serving, { winner: 1, result: 'Ace' });
    syncServerFromEngine();
    expect(serving).toBe(1);
  });

  it('correctly alternates across a full set when player 2 serves first', () => {
    changeServer(); // serving = 1

    const expectedServers = [1, 0, 1, 0, 1, 0]; // alternates starting from 1

    for (let game = 0; game < 6; game++) {
      // Verify server at start of each game
      expect(serving).toBe(expectedServers[game]);

      // Win a love game for the current server
      for (let pt = 0; pt < 4; pt++) {
        addPointAsClient(engine, serving, { winner: serving });
        syncServerFromEngine();
      }
    }
    // Set complete (6-0), new set starts — server continues alternation
    // After 6 games starting from player 2: next is player 2 again (6 is even)
    expect(serving).toBe(1);
  });

  it('handles mixed winners (breaks of serve) with player 2 starting', () => {
    changeServer(); // serving = 1

    // Game 1: player 2 serves but player 1 breaks (wins 4 return points)
    for (let pt = 0; pt < 4; pt++) {
      addPointAsClient(engine, serving, { winner: 0 }); // player 1 wins on return
      syncServerFromEngine();
    }
    // Game 1 complete (broken): server switches to player 1
    expect(serving).toBe(0);

    // Game 2: player 1 serves, holds (wins 4 points)
    for (let pt = 0; pt < 4; pt++) {
      addPointAsClient(engine, serving, { winner: 0 });
      syncServerFromEngine();
    }
    // Game 2 complete: server switches to player 2
    expect(serving).toBe(1);
  });

  it('no switch needed when player 1 serves first (default)', () => {
    // Don't call changeServer — serving stays at 0
    expect(serving).toBe(0);

    // Score an Ace
    addPointAsClient(engine, serving, { winner: 0, result: 'Ace' });
    syncServerFromEngine();
    expect(serving).toBe(0); // still player 1, mid-game

    // Win the game
    addPointAsClient(engine, serving, { winner: 0 });
    syncServerFromEngine();
    addPointAsClient(engine, serving, { winner: 0 });
    syncServerFromEngine();
    addPointAsClient(engine, serving, { winner: 0 });
    syncServerFromEngine();

    // After game, alternates to player 2
    expect(serving).toBe(1);
  });
});
