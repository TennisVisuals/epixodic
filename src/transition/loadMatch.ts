import { loadDetails, stateChangeEvent, updateScore } from './displayUpdate';
import { clearActionEvents, env, updatePositions, resetEngine, definePlayer, updateParticipant } from './env';
import { browserStorage } from './browserStorage';
import { defineActionEvents } from './events';
import { viewManager } from './viewManager';
import { isJSON } from './utilities';
import { tools } from 'tods-competition-factory';

function initializeLegacyMatch(match_data: any) {
  env.engine.reset();
  definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
  definePlayer({ index: 1, firstName: 'Player', lastName: '2' });

  if (match_data.match && !match_data.match.muid) {
    match_data.match.muid = tools.UUID();
  }
}

function loadMatchMetadata(match_data: any) {
  if (match_data.match) {
    Object.assign(env.metadata.match, match_data.match);
  }
  if (match_data.first_service) env.serving = match_data.first_service;
  if (match_data.tournament) Object.assign(env.metadata.tournament, match_data.tournament);
  if (match_data.format) {
    resetEngine(match_data.format.code || match_data.format);
    const mdFormat = document.getElementById('md_format');
    if (mdFormat) mdFormat.innerHTML = match_data.format.name;
  }
}

function loadLegacyPlayers(players: any[]) {
  console.log('[HVE] Loading', players.length, 'legacy players');
  players.forEach((player: any, index: number) => {
    const fullName = player.participantName || player.name || `Player ${index + 1}`;
    const nameParts = fullName.trim().split(/\s+/);
    const standardGivenName = nameParts[0] || '';
    const standardFamilyName = nameParts.slice(1).join(' ') || '';
    const sideNumber = index + 1;

    updateParticipant({
      sideNumber,
      person: { standardGivenName, standardFamilyName },
    });
  });
  console.log('[HVE] Finished loading legacy players');
}

function loadPoints(points: any[], context: string) {
  console.log(`[HVE] Loading ${points.length} ${context} points`);
  points.forEach((point: any) => {
    // Pass server when replaying stored points (they have engine-derived server values)
    const opts: any = { winner: point.winner, result: point.result };
    if (point.server !== undefined) opts.server = point.server;
    env.engine.addPoint(opts);
  });
  console.log(`[HVE] Finished loading ${context} points`);
}

function initializeTODSMatch(savedFormat: string) {
  console.log('[HVE] loadMatch creating new engine with format:', savedFormat);
  resetEngine(savedFormat);

  console.log('[HVE] Defining default players');
  definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
  definePlayer({ index: 1, firstName: 'Player', lastName: '2' });
}

function loadTODSSides(sides: any[]) {
  console.log('[HVE] Loading', sides.length, 'participants from TODS');
  sides.forEach((side: any) => {
    const participant = side.participant;
    if (!participant) return;

    const givenName = participant.person?.standardGivenName || '';
    const familyName = participant.person?.standardFamilyName || '';

    updateParticipant({
      sideNumber: side.sideNumber,
      person: { standardGivenName: givenName, standardFamilyName: familyName },
    });
  });
  console.log('[HVE] Finished loading participants');
}

export function loadMatch(match_id: string, view = 'entry') {
  if (!match_id) {
    viewManager('entry');
    return;
  }

  const json = browserStorage.get(match_id);
  const match_data = json && isJSON(json) && match_id ? JSON.parse(browserStorage.get(match_id) ?? '[]') : undefined;

  if (!match_data) {
    viewManager('entry');
    return;
  }

  env.loading_match = true;
  const isLegacyStorage = match_data.muid && !match_data.matchUpId;

  if (isLegacyStorage) {
    initializeLegacyMatch(match_data);
  }

  clearActionEvents();
  browserStorage.set('current_match', match_id);
  
  loadMatchMetadata(match_data);

  if (match_data.points && match_data.points.length > 0) {
    loadPoints(match_data.points, 'legacy format');
  }

  if (isLegacyStorage) {
    if (match_data.players) {
      loadLegacyPlayers(match_data.players);
    }
    const legacyPoints = match_data._appData?.points || match_data.points;
    if (legacyPoints) {
      loadPoints(legacyPoints, 'legacy _appData');
    }
  } else {
    const savedFormat = match_data.matchUpFormat || 'SET3-S:6/TB7';
    initializeTODSMatch(savedFormat);

    if (match_data.sides) {
      loadTODSSides(match_data.sides);
    }

    const todsPoints = match_data.score?.points;
    if (todsPoints) {
      loadPoints(todsPoints, 'TODS');
    }
  }

  updatePositions();
  updateScore();
  loadDetails();
  stateChangeEvent();
  defineActionEvents();

  env.loading_match = false;
  viewManager(view);
}
