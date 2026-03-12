import { Server, Socket } from 'socket.io';
import { updateMatch, setMatchHistory, getMatch, getActiveMatchIds, pruneStaleMatches } from './matchStore.js';
import { persistMatchHistory } from './persistence.js';
import type { ScoreUpdate, MatchHistory } from './types.js';

const STALE_MATCH_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours
const PRUNE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function createRelay(io: Server): void {
  // --- Tracker namespace: mobile trackers push scores here ---
  const tracker = io.of('/tracker');

  tracker.on('connection', (socket: Socket) => {
    console.log(`[tracker] connected: ${socket.id}`);

    socket.on('score', (data: ScoreUpdate) => {
      if (!data?.matchUpId) {
        socket.emit('error', { message: 'matchUpId required' });
        return;
      }

      updateMatch(data);
      socket.emit('ack', { matchUpId: data.matchUpId, received: true });

      // Fan out to all listeners subscribed to this match
      listeners.to(data.matchUpId).emit('score', data);

      // Also emit to the "all" room for dashboards
      listeners.to('all').emit('score', data);
    });

    socket.on('history', async (data: MatchHistory) => {
      if (!data?.matchUpId) {
        socket.emit('error', { message: 'matchUpId required' });
        return;
      }

      setMatchHistory(data);
      socket.emit('ack', { matchUpId: data.matchUpId, received: true });

      // Persist to factory server if configured
      await persistMatchHistory(data);

      // Notify listeners
      listeners.to(data.matchUpId).emit('history', data);
    });

    socket.on('disconnect', () => {
      console.log(`[tracker] disconnected: ${socket.id}`);
    });
  });

  // --- Listener namespace: TMX, scoreboards, epixodic displays subscribe here ---
  const listeners = io.of('/live');

  listeners.on('connection', (socket: Socket) => {
    console.log(`[live] connected: ${socket.id}`);

    // Subscribe to score updates for a specific match
    socket.on('subscribe', (matchUpId: string) => {
      socket.join(matchUpId);

      // Send current state if available
      const match = getMatch(matchUpId);
      if (match) {
        socket.emit('score', match.lastUpdate);
      }
    });

    // Unsubscribe from a match
    socket.on('unsubscribe', (matchUpId: string) => {
      socket.leave(matchUpId);
    });

    // Subscribe to all score updates (for dashboards/schedule views)
    socket.on('subscribe:all', () => {
      socket.join('all');

      // Send list of active matches
      socket.emit('active', getActiveMatchIds());
    });

    socket.on('unsubscribe:all', () => {
      socket.leave('all');
    });

    socket.on('disconnect', () => {
      console.log(`[live] disconnected: ${socket.id}`);
    });
  });

  // Periodically prune stale matches
  setInterval(() => {
    const pruned = pruneStaleMatches(STALE_MATCH_AGE_MS);
    if (pruned > 0) {
      console.log(`[relay] pruned ${pruned} stale matches`);
    }
  }, PRUNE_INTERVAL_MS);
}
