import { browserStorage } from '../state/browserStorage';
import { firstAndLast } from '../utils/utilities';
import { scoreGovernor, participantTypes, participantRoles, matchUpTypes } from 'tods-competition-factory';
import { buildEpisodes } from '@tennisvisuals/scoring-visualizations';

const { ScoringEngine } = scoreGovernor;
const { INDIVIDUAL } = participantTypes;
const { COMPETITOR } = participantRoles;
const { SINGLES } = matchUpTypes;

export const charts: any = {};

// ── ScoringEngine ──────────────────────────────────────────────────────
function createEngine(format = 'SET3-S:6/TB7') {
  return new ScoringEngine({ matchUpFormat: format });
}

// ── Metadata Store ─────────────────────────────────────────────────────
function createDefaultMetadata() {
  return {
    players: [
      {
        participantName: 'Player One',
        participantId: 'player_0',
        participantType: INDIVIDUAL,
        participantRole: COMPETITOR,
        person: { standardGivenName: 'Player', standardFamilyName: 'One' },
      },
      {
        participantName: 'Player Two',
        participantId: 'player_1',
        participantType: INDIVIDUAL,
        participantRole: COMPETITOR,
        person: { standardGivenName: 'Player', standardFamilyName: 'Two' },
      },
    ] as any[],
    match: {} as any,
    tournament: {} as any,
  };
}

export const app: any = {
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
  match_swap: false,
  swap_sides: false,
  orientation: 'vertical',
  serving: 0,
  receiving: 1,
  edit_point_index: undefined,
  provider: undefined,
  engine: createEngine(),
  metadata: createDefaultMetadata(),
  loading_match: false,
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

// ── Helper: Get episodes from engine state ────────────────────────────
export function getEpisodes(): any[] {
  return buildEpisodes(env.engine.getState());
}

// ── Helper: Get point display values ─────────────────────────────────
const POINT_DISPLAY = ['0', '15', '30', '40'];
function pointDisplayPair(p1: number, p2: number, isTiebreak: boolean): [string, string] {
  if (isTiebreak) return [String(p1), String(p2)];

  // Before deuce: use standard progression
  if (p1 < 4 && p2 < 4) return [POINT_DISPLAY[p1], POINT_DISPLAY[p2]];

  // One side won the game outright (threshold met with min difference)
  if (p1 < 4 || p2 < 4) {
    return [p1 < 4 ? POINT_DISPLAY[p1] : 'G', p2 < 4 ? POINT_DISPLAY[p2] : 'G'];
  }

  // Both at or above deuce
  if (p1 === p2) return ['40', '40'];
  return p1 > p2 ? ['AD', '40'] : ['40', 'AD'];
}

// ── Helper: Get score for display (compatible with updateScore) ───────
export function getScoreForDisplay() {
  const state = env.engine.getState();
  const engineScore = env.engine.getScore();
  const sets = state.score?.sets || [];

  const side1SetWins = sets.filter((s: any) => s.winningSide === 1).length;
  const side2SetWins = sets.filter((s: any) => s.winningSide === 2).length;

  // Check if current game is a tiebreak
  const currentSet = sets.length > 0 ? sets[sets.length - 1] : null;
  const isTiebreak = currentSet?.side1TiebreakScore !== undefined || currentSet?.side2TiebreakScore !== undefined;

  const [p1Display, p2Display] = pointDisplayPair(engineScore.points[0], engineScore.points[1], isTiebreak);

  return {
    counters: {
      sets: [side1SetWins, side2SetWins],
      games: engineScore.games,
    },
    points: `${p1Display}-${p2Display}`,
    components: {
      sets: sets.map((s: any) => ({
        games: [s.side1Score || 0, s.side2Score || 0],
      })),
    },
  };
}

// ── Helper: Get setsToWin from format string ──────────────────────────
export function getSetsToWin(): number {
  const format = env.engine.getFormat();
  const match = format.match(/^SET(\d+)/);
  if (match) return Math.ceil(parseInt(match[1]) / 2);
  return 1; // Single set format
}

// ── Helper: Get current server from engine state ─────────────────────
// The ScoringEngine derives server based on matchUpFormat rules
// (handles tiebreaks, NOAD, game alternation, etc.)
export function getNextServer(): number {
  const state = env.engine.getState();
  const points = state.history?.points || [];
  if (points.length === 0) return env.serving;

  // Read server from the last stored point — the engine derived it
  return points[points.length - 1].server ?? env.serving;
}

// ── Helper: Check if format uses NoAD ─────────────────────────────────
export function getNoAd(): boolean {
  const format = env.engine.getFormat();
  return format.includes('NOAD');
}

// ── Metadata Helpers ──────────────────────────────────────────────────
export function definePlayer(opts: { index: number; firstName: string; lastName: string }) {
  const player = env.metadata.players[opts.index] || {};
  player.participantName = `${opts.firstName} ${opts.lastName}`.trim();
  player.person = {
    ...player.person,
    standardGivenName: opts.firstName,
    standardFamilyName: opts.lastName,
  };
  player.participantId = player.participantId || `player_${opts.index}`;
  player.participantType = INDIVIDUAL;
  player.participantRole = COMPETITOR;
  env.metadata.players[opts.index] = player;
}

export function updateParticipant(update: any) {
  const index = (update.sideNumber || 1) - 1;
  const player = env.metadata.players[index] || {};
  if (update.person) {
    player.person = { ...player.person, ...update.person };
    const given = update.person.standardGivenName || player.person.standardGivenName || '';
    const family = update.person.standardFamilyName || player.person.standardFamilyName || '';
    player.participantName = `${given} ${family}`.trim();
  }
  // Copy other attributes
  const skipKeys = ['sideNumber', 'person'];
  Object.keys(update).forEach((key) => {
    if (!skipKeys.includes(key)) player[key] = update[key];
  });
  env.metadata.players[index] = player;
}

// ── No-ops (replaced functionality) ──────────────────────────────────
export function clearActionEvents() {
  // No-op: events system removed with UMO
}

// ── Position and Archive ─────────────────────────────────────────────
export function updatePositions() {
  const left_side = env.swap_sides ? 1 : 0;
  const right_side = env.swap_sides ? 0 : 1;

  updateMatchArchive();

  const player_names = env.metadata.players;
  const p1 = document.getElementById('playerone');
  const p2 = document.getElementById('playertwo');
  if (p1) p1.innerHTML = firstAndLast(player_names[left_side].participantName || '');
  if (p2) p2.innerHTML = firstAndLast(player_names[right_side].participantName || '');

  const display_player_0 = Array.from(document.querySelectorAll('.display_player_0'));
  display_player_0.forEach((element) => (element.innerHTML = player_names[left_side].participantName || ''));
  const display_player_1 = Array.from(document.querySelectorAll('.display_player_1'));
  display_player_1.forEach((element) => (element.innerHTML = player_names[right_side].participantName || ''));
}

export function updateMatchArchive(force?: boolean) {
  if (env.loading_match) return;

  const match_id = browserStorage.get('current_match');
  if (!match_id) return;

  const players = env.metadata.players;
  const state = env.engine.getState();
  const matchPoints = state.history?.points || [];

  const save =
    force ||
    matchPoints.length ||
    (players[0].participantName != default_players[0] && players[1].participantName != default_players[1]);

  if (!save) return;

  const match_archive = JSON.parse(browserStorage.get('match_archive') || '[]');
  if (!match_archive.includes(match_id)) {
    match_archive.push(match_id);
    browserStorage.set('match_archive', JSON.stringify(match_archive));
  }

  const matchUpFormat = env.engine.getFormat();
  const scoreboard = env.engine.getScoreboard();
  const sets = state.score?.sets || [];

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

  const todsMatchUp = {
    tournamentId: env.metadata.tournament?.tournamentId || env.metadata.match?.tournamentId,
    matchUpId: match_id,
    matchUpFormat,
    matchUpType: SINGLES,
    sides,
    score: {
      sets,
      points: matchPoints,
      scoreStringSide1: scoreboard,
      scoreStringSide2: scoreboard,
    },
    _appData: {
      scoreboard,
      first_service: env.serving,
    },
  };

  browserStorage.set(match_id, JSON.stringify(todsMatchUp));
}

export function loadStoredMatch(match_id: string): any {
  const stored = browserStorage.get(match_id);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading match:', e);
    return null;
  }
}

// ── Engine Reset Helper ──────────────────────────────────────────────
export function resetEngine(format = 'SET3-S:6/TB7') {
  env.engine = createEngine(format);
  env.metadata = createDefaultMetadata();
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
