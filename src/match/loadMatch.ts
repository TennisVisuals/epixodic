import { loadDetails, stateChangeEvent, updateScore } from '../display/displayUpdate';
import { clearActionEvents, env, updatePositions, resetEngine, definePlayer, updateParticipant } from '../state/env';
import { setCurrentMatchUpId } from '../state/matchContext';
import { browserStorage } from '../state/browserStorage';
import { defineActionEvents } from '../events/events';
import { isJSON } from '../utils/utilities';
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
}

function loadPoints(points: any[]) {
  points.forEach((point: any) => {
    // Pass server when replaying stored points (they have engine-derived server values)
    const opts: any = { winner: point.winner, result: point.result };
    if (point.server !== undefined) opts.server = point.server;
    // Preserve decoration fields
    if (point.rallyLength != null) opts.rallyLength = point.rallyLength;
    if (point.hand) opts.hand = point.hand;
    if (point.stroke) opts.stroke = point.stroke;
    if (point.code) opts.code = point.code;
    if (point.location) opts.location = point.location;
    if (point.first_serve) opts.first_serve = point.first_serve;
    env.engine.addPoint(opts);
  });
}

function initializeTODSMatch(savedFormat: string) {
  resetEngine(savedFormat);
  definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
  definePlayer({ index: 1, firstName: 'Player', lastName: '2' });
}

function loadTODSSides(sides: any[]) {
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
}

export function loadMatch(match_id: string): boolean {
  if (!match_id) {
    return false;
  }

  const json = browserStorage.get(match_id);
  const match_data = json && isJSON(json) && match_id ? JSON.parse(browserStorage.get(match_id) ?? '[]') : undefined;

  if (!match_data) {
    return false;
  }

  env.loading_match = true;
  const isLegacyStorage = match_data.muid && !match_data.matchUpId;

  if (isLegacyStorage) {
    initializeLegacyMatch(match_data);
  }

  clearActionEvents();
  setCurrentMatchUpId(match_id);
  
  loadMatchMetadata(match_data);

  if (match_data.points && match_data.points.length > 0) {
    loadPoints(match_data.points);
  }

  if (isLegacyStorage) {
    if (match_data.players) {
      loadLegacyPlayers(match_data.players);
    }
    const legacyPoints = match_data._appData?.points || match_data.points;
    if (legacyPoints) {
      loadPoints(legacyPoints);
    }
  } else {
    const savedFormat = match_data.matchUpFormat || 'SET3-S:6/TB7';
    initializeTODSMatch(savedFormat);

    if (match_data.sides) {
      loadTODSSides(match_data.sides);
    }

    const todsPoints = match_data.score?.points;
    if (todsPoints) {
      loadPoints(todsPoints);
    }
  }

  updatePositions();
  updateScore();
  loadDetails();
  stateChangeEvent();
  defineActionEvents();

  env.loading_match = false;
  return true;
}
