import axios from 'axios';
import type { MatchHistory } from './types.js';

let factoryServerUrl: string | undefined;

export function configurePersistence(url?: string): void {
  factoryServerUrl = url;
}

/**
 * Push match history to competition-factory-server for persistence.
 * This is a fire-and-forget operation — failures are logged but do not
 * block the relay from broadcasting.
 */
export async function persistMatchHistory(history: MatchHistory): Promise<void> {
  if (!factoryServerUrl) return;

  try {
    await axios.post(`${factoryServerUrl}/factory/matchup/score`, {
      params: {
        tournamentId: history.tournamentId,
        matchUpId: history.matchUpId,
        matchUpFormat: history.matchUpFormat,
        points: history.points,
        score: history.score,
      },
    });
  } catch (err: any) {
    console.error(`[persist] Failed to persist match ${history.matchUpId}: ${err.message}`);
  }
}
