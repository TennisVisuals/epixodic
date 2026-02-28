import { resetMatch } from '../../match/displayMatchArchive';
import { browserStorage } from '../../state/browserStorage';
import type { HydratedMatchUp } from '../types';

let matchUps = $state<HydratedMatchUp[]>([]);

const myMatchUps = $derived(matchUps.filter((m) => !m.tournamentId));
const tournamentMatchUps = $derived(matchUps.filter((m) => !!m.tournamentId));

export function getLocalMatchUpsState() {
  return {
    get matchUps() {
      return matchUps;
    },
    get myMatchUps() {
      return myMatchUps;
    },
    get tournamentMatchUps() {
      return tournamentMatchUps;
    },
  };
}

export function refreshLocalMatchUps() {
  const archive: string[] = JSON.parse(browserStorage.get('match_archive') || '[]')
    .filter((item: any, i: number, s: any) => s.lastIndexOf(item) === i)
    .reverse();

  const loaded: HydratedMatchUp[] = [];
  for (const matchId of archive) {
    const raw = browserStorage.get(matchId);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (data) loaded.push(data as HydratedMatchUp);
    } catch {
      // skip corrupt entries
    }
  }
  matchUps = loaded;
}

export function deleteLocalMatchUp(matchUpId: string) {
  browserStorage.remove(matchUpId);
  const currentMatchId = browserStorage.get('current_match');
  let archive = JSON.parse(browserStorage.get('match_archive') || '[]');
  archive = archive.filter((id: string) => id !== matchUpId);
  browserStorage.set('match_archive', JSON.stringify(archive));

  if (matchUpId === currentMatchId) {
    resetMatch();
  }

  refreshLocalMatchUps();
}

// Auto-refresh when vanilla JS scoring saves a match
if (typeof window !== 'undefined') {
  window.addEventListener('matcharchive:updated', () => refreshLocalMatchUps());
}
