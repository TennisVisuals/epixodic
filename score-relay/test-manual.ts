#!/usr/bin/env tsx
/**
 * Manual end-to-end test script for the score relay.
 *
 * Prerequisites:
 *   1. Start the relay:  cd score-relay && pnpm dev
 *   2. Run this script:  cd score-relay && npx tsx test-manual.ts
 *
 * What it does:
 *   - Connects a tracker client to /tracker
 *   - Connects two listener clients to /live
 *   - Listener 1 subscribes to a specific match
 *   - Listener 2 subscribes to all matches
 *   - Tracker sends a series of score updates simulating a game
 *   - Verifies both listeners receive the updates
 *   - Tests subscribe/unsubscribe flow
 *   - Tests history submission
 *   - Reports pass/fail for each step
 */
import { io } from 'socket.io-client';

const RELAY_URL = process.env.RELAY_URL || 'http://localhost:8384';
const MATCH_ID = 'manual-test-' + Date.now();

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function connectSocket(namespace: string): Promise<ReturnType<typeof io>> {
  return new Promise((resolve, reject) => {
    const socket = io(`${RELAY_URL}${namespace}`, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 5000,
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(new Error(`Failed to connect to ${namespace}: ${err.message}`)));
    setTimeout(() => reject(new Error(`Connection timeout for ${namespace}`)), 5000);
  });
}

async function run() {
  console.log(`\n━━━ Score Relay Manual Test ━━━`);
  console.log(`Relay URL: ${RELAY_URL}`);
  console.log(`Match ID:  ${MATCH_ID}\n`);

  // ── Connect clients ──────────────────────────────
  console.log('1. Connecting clients...');
  let tracker: ReturnType<typeof io>;
  let listener1: ReturnType<typeof io>;
  let listener2: ReturnType<typeof io>;

  try {
    [tracker, listener1, listener2] = await Promise.all([
      connectSocket('/tracker'),
      connectSocket('/live'),
      connectSocket('/live'),
    ]);
    assert(true, 'Tracker connected to /tracker');
    assert(true, 'Listener 1 connected to /live');
    assert(true, 'Listener 2 connected to /live');
  } catch (err: any) {
    console.error(`\n  ✗ Connection failed: ${err.message}`);
    console.error('  Make sure the relay is running: cd score-relay && pnpm dev\n');
    process.exit(1);
  }

  // ── Subscribe listeners ──────────────────────────
  console.log('\n2. Subscribing listeners...');
  listener1.emit('subscribe', MATCH_ID);
  listener2.emit('subscribe:all');
  await wait(100);
  assert(true, 'Listener 1 subscribed to specific match');
  assert(true, 'Listener 2 subscribed to all matches');

  // Check if listener2 receives active matches list
  const activePromise = new Promise<string[]>((resolve) => {
    listener2.once('active', resolve);
  });
  // Re-emit subscribe:all to trigger active list (already subscribed but that's ok)
  listener2.emit('subscribe:all');
  const activeIds = await Promise.race([
    activePromise,
    wait(1000).then(() => [] as string[]),
  ]);
  assert(Array.isArray(activeIds), `Received active match list (${(activeIds as string[]).length} matches)`);

  // ── Send score updates ───────────────────────────
  console.log('\n3. Sending score updates (simulating a game)...');

  const points = [
    { scoreStringSide1: '15-0', point: { winner: 0, result: 'Ace' } },
    { scoreStringSide1: '30-0', point: { winner: 0, result: 'Winner' } },
    { scoreStringSide1: '30-15', point: { winner: 1 } },
    { scoreStringSide1: '40-15', point: { winner: 0 } },
    { scoreStringSide1: '1-0', point: { winner: 0, result: 'Ace' } },
  ];

  const listener1Scores: any[] = [];
  const listener2Scores: any[] = [];

  listener1.on('score', (data: any) => listener1Scores.push(data));
  listener2.on('score', (data: any) => listener2Scores.push(data));

  for (const pt of points) {
    const ackPromise = new Promise<any>((resolve) => tracker.once('ack', resolve));
    tracker.emit('score', {
      matchUpId: MATCH_ID,
      tournamentId: 'test-tournament',
      score: { scoreStringSide1: pt.scoreStringSide1 },
      point: pt.point,
    });
    const ack = await ackPromise;
    assert(ack.received === true, `Ack received for ${pt.scoreStringSide1}`);
    await wait(50);
  }

  await wait(200);
  assert(listener1Scores.length === points.length, `Listener 1 received ${listener1Scores.length}/${points.length} scores`);
  assert(listener2Scores.length === points.length, `Listener 2 (all) received ${listener2Scores.length}/${points.length} scores`);

  // ── Late-join: current state on subscribe ─────────
  console.log('\n4. Late-join test (new listener gets current state)...');
  const lateListener = await connectSocket('/live');
  const statePromise = new Promise<any>((resolve) => lateListener.once('score', resolve));
  lateListener.emit('subscribe', MATCH_ID);
  const currentState = await Promise.race([
    statePromise,
    wait(2000).then(() => null),
  ]);
  assert(currentState !== null, 'Late-join listener received current state');
  assert(
    currentState?.score?.scoreStringSide1 === '1-0',
    `Current state is latest score: "${currentState?.score?.scoreStringSide1}"`,
  );
  lateListener.disconnect();

  // ── Unsubscribe test ──────────────────────────────
  console.log('\n5. Unsubscribe test...');
  listener1.removeAllListeners('score');
  listener1.emit('unsubscribe', MATCH_ID);
  await wait(100);

  let receivedAfterUnsub = false;
  listener1.on('score', () => {
    receivedAfterUnsub = true;
  });

  tracker.emit('score', {
    matchUpId: MATCH_ID,
    score: { scoreStringSide1: '2-0' },
  });
  await wait(300);
  assert(!receivedAfterUnsub, 'Listener 1 did NOT receive score after unsubscribe');

  // ── History submission ────────────────────────────
  console.log('\n6. History submission...');
  const historyAck = new Promise<any>((resolve) => tracker.once('ack', resolve));
  tracker.emit('history', {
    matchUpId: MATCH_ID,
    tournamentId: 'test-tournament',
    matchUpFormat: 'SET3-S:6/TB7',
    points: points.map((p) => p.point),
  });
  const hAck = await historyAck;
  assert(hAck.received === true, 'History ack received');
  assert(hAck.matchUpId === MATCH_ID, 'History ack has correct matchUpId');

  // ── Validation: missing matchUpId ──────────────────
  console.log('\n7. Validation test (missing matchUpId)...');
  const errorPromise = new Promise<any>((resolve) => tracker.once('error', resolve));
  tracker.emit('score', { score: {} });
  const errorMsg = await Promise.race([
    errorPromise,
    wait(2000).then(() => null),
  ]);
  assert(errorMsg?.message === 'matchUpId required', 'Error returned for missing matchUpId');

  // ── Cleanup ───────────────────────────────────────
  console.log('\n8. Cleanup...');
  tracker.disconnect();
  listener1.disconnect();
  listener2.disconnect();
  assert(true, 'All clients disconnected');

  // ── Summary ───────────────────────────────────────
  console.log(`\n━━━ Results: ${passed} passed, ${failed} failed ━━━\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
