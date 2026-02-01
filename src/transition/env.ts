import { browserStorage } from './browserStorage';
import { firstAndLast } from './utilities';
import { migrateMatchData } from '../services/matchObject/formatMigration';

// UMO v3: Standard match object (drives UI)
import matchObjectV3 from '@tennisvisuals/universal-match-object';

// UMO v4: Shadow match for parallel testing (no UI interaction)
import { Match as MatchV4 } from '@tennisvisuals/universal-match-object/v4-umo';

import { participantTypes, participantRoles, matchUpTypes } from 'tods-competition-factory';

const { INDIVIDUAL } = participantTypes;
const { COMPETITOR } = participantRoles;
const { SINGLES } = matchUpTypes;

export const charts: any = {};

// Create initial matches - V3 FIRST (drives UI), then V4 (shadow for testing)
function createDefaultMatches() {
  console.log('[HVE] Creating default matches - env.match (v3) + env.matchUp (v4)');
  
  // V3 Match - drives UI via env.match
  const matchV3 = matchObjectV3.Match({ matchUpFormat: 'SET3-S:6/TB7' });
  matchV3.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
  matchV3.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
  
  // V4 Match - shadow for testing via env.matchUp
  const matchV4 = MatchV4({ matchUpFormat: 'SET3-S:6/TB7' });
  matchV4.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
  matchV4.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
  
  console.log('[HVE] Default matches created - env.match (v3) and env.matchUp (v4) ready');
  
  return { matchV3, matchV4 };
}

const { matchV3, matchV4 } = createDefaultMatches();

// Do NOT export match/matchUp as standalone - forces use of env.match and env.matchUp
// This makes it clear: env.match = v3 (UI), env.matchUp = v4 (testing)
// Commenting out to enforce this pattern:
// export const match = matchV3;
// export const matchUp = matchV4;

export const app: any = {
  // broadcast property removed
  user_uuid: undefined,
};

export const settings: any = {
  track_shot_types: true,
  audible_clicks: false,
  display_gamefish: true,
  auto_swap_sides: true,
  point_buttons: false,
};

export const env: any = {
  lets: 0,
  rally: 0,
  undone: [],
  view: 'entry',
  serve2nd: false,
  rally_mode: false,
  edit_player: undefined,
  match_swap: false, // automatic swap
  swap_sides: false, // user initiated swap
  orientation: 'vertical',
  serving: 0, // Will be set from match
  receiving: 1, // Will be set from match
  edit_point_index: undefined,
  provider: undefined,
  match: matchV3, // env.match = V3 UMO (drives all UI)
  matchUp: matchV4, // env.matchUp = V4 UMO (parallel testing only, no UI)
  loading_match: false, // Flag to prevent saving during match load
};

const c1 = 'rgb(64, 168, 75)';
const c2 = 'rgb(255, 116, 51)';
const c3 = 'rgb(221, 56, 48)';
export const buttons: any = {
  first_serve: { color: c1, type: 'toggle' },
  second_serve: { color: c2, type: 'toggle' },
  double_fault: { color: c3, type: 'flash' },
  penalty: { color: c3, type: 'flash' },
  first_ace: { color: c1, type: 'flash' },
  second_ace: { color: c2, type: 'flash' },
  server_winner: { color: c1, type: 'flash' },
  server_unforced: { color: c3, type: 'flash' },
  server_forced: { color: c2, type: 'flash' },
  receiving_winner: { color: c1, type: 'flash' },
  receiving_unforced: { color: c3, type: 'flash' },
  receiving_forced: { color: c2, type: 'flash' },
};
export const options = {
  user_swap: false,
  highlight_better_stats: true,
  vertical_view: browserStorage.get('vertical_view') || 'vblack',
  horizontal_view: browserStorage.get('horizontal_view') || 'hblack',
};

export const device: any = {
  isStandalone: 'standalone' in globalThis.navigator && globalThis.navigator.standalone,
  isIDevice: /iphone|ipod|ipad/i.test(globalThis.navigator.userAgent),
  isMobile:
    globalThis.matchMedia('(max-width: 768px)').matches ||
    /mobile|android|iphone|ipod|ipad/i.test(globalThis.navigator.userAgent),
  geoposition: {},
};

export const default_players = ['Player One', 'Player Two'];

export function clearActionEvents() {
  env.match.events.clearEvents();
}

export function updatePositions() {
  const left_side = env.swap_sides ? 1 : 0;
  const right_side = env.swap_sides ? 0 : 1;

  updateMatchArchive();

  // CRITICAL: Use env.match not matchUp! env.match gets replaced when loading,
  // but matchUp is a global constant that never changes
  const player_names = env.match.metadata.players();
  const p1 = document.getElementById('playerone');
  const p2 = document.getElementById('playertwo');
  if (p1) p1.innerHTML = firstAndLast(player_names[left_side].participantName || '');
  if (p2) p2.innerHTML = firstAndLast(player_names[right_side].participantName || '');

  // new way
  const display_player_0 = Array.from(document.querySelectorAll('.display_player_0'));
  display_player_0.forEach((element) => (element.innerHTML = player_names[left_side].participantName || ''));
  const display_player_1 = Array.from(document.querySelectorAll('.display_player_1'));
  display_player_1.forEach((element) => (element.innerHTML = player_names[right_side].participantName || ''));
}

export function updateMatchArchive(force?: boolean) {
  // Don't save while loading a match (prevents overwriting during load)
  if (env.loading_match) {
    return;
  }

  const match_id = browserStorage.get('current_match');
  if (!match_id) {
    return;
  }

  // CRITICAL: Use env.match not matchUp
  const players = env.match.metadata.players();
  const matchPoints = env.match.history.points();

  const save =
    force ||
    matchPoints.length ||
    (players[0].participantName != default_players[0] && players[1].participantName != default_players[1]);

  if (!save) {
    return;
  }

  // add key for current match
  const match_archive = JSON.parse(browserStorage.get('match_archive') || '[]');

  if (!match_archive.includes(match_id)) {
    match_archive.push(match_id);
    browserStorage.set('match_archive', JSON.stringify(match_archive));
  }

  // Build TODS matchUp from UMO (UMO is always TODS format after load/conversion)
  const match = env.match.metadata.defineMatch();
  const tournament = env.match.metadata.defineTournament();
  // Use modern property accessor instead of deprecated settings() method
  const matchUpFormat = env.match.format.code || 'SET3-S:6/TB7';

  // Build minimal TODS score structure
  // We save points, so UMO can reconstruct sets on load
  const scoreboard = env.match.scoreboard();
  const score = {
    sets: [], // Will be reconstructed from points on load
    scoreStringSide1: scoreboard,
    scoreStringSide2: scoreboard, // TODO: flip for side2 perspective
  };

  // Build TODS sides from players (sideNumber 1, 2)
  const sides = players.map((player: any, index: number) => ({
    sideNumber: index + 1,
    participantId: player.participantId,
    participant: {
      participantId: player.participantId,
      participantRole: COMPETITOR,
      participantType: INDIVIDUAL,
      participantName: player.participantName,
      person: player.person || {
        standardGivenName: player.participantName?.split(' ')[0] || '',
        standardFamilyName: player.participantName?.split(' ').slice(1).join(' ') || '',
      },
    },
  }));

  // Add points detail to score object (TODS format)
  const todsScore = {
    ...score,
    points: matchPoints,
  };

  // TODS matchUp structure - always save as TODS (no legacy fallbacks)
  const todsMatchUp = {
    tournamentId: tournament?.tournamentId || match?.tournamentId,
    matchUpId: match_id,
    matchUpFormat: matchUpFormat,
    matchUpType: SINGLES,
    sides: sides,
    score: todsScore,
    // App-specific data (not part of TODS matchUp spec, but needed for app)
    _appData: {
      scoreboard: env.match.scoreboard(),
      first_service: env.match.set.firstService(),
    },
  };

  browserStorage.set(match_id, JSON.stringify(todsMatchUp));
}

// Add function to load and auto-migrate stored matches
export function loadStoredMatch(match_id: string): any {
  const stored = browserStorage.get(match_id);
  if (!stored) return null;

  try {
    const matchData = JSON.parse(stored);

    // Auto-migrate if this is a legacy match (not TODS-native or Factory-migrated)
    if (!matchData._tods_native && !matchData._factory_migrated) {
      const migrated = migrateMatchData(matchData);
      // Save the migrated version with TODS flag
      migrated._tods_native = true;
      browserStorage.set(match_id, JSON.stringify(migrated));
      return migrated;
    }

    return matchData;
  } catch (e) {
    console.error('Error loading match:', e);
    return null;
  }
}

export function restoreAppState() {
  const app_settings = browserStorage.get('CH_AppSettings');
  if (app_settings) Object.assign(settings, JSON.parse(app_settings));
  Object.keys(settings).forEach((key) => {
    const em: any = document.getElementById(key);
    if (em) em.checked = settings[key];
  });
  const app_state = browserStorage.get('CH_AppState');
  if (app_state) Object.assign(app, JSON.parse(app_state));
}

export function updateAppState() {
  Object.keys(settings).forEach((key) => {
    const em: any = document.getElementById(key);
    if (em) settings[key] = em.checked;
  });
  browserStorage.set('CH_AppSettings', JSON.stringify(settings));
  browserStorage.set('CH_AppState', JSON.stringify(app));
}

export function setOrientation() {
  if (device.isMobile) {
    env.orientation = globalThis.screen.orientation.type == 'landscape-primary' ? 'landscape' : 'portrait';
  } else {
    env.orientation = globalThis.innerWidth > globalThis.innerHeight ? 'landscape' : 'portrait';
  }
}
