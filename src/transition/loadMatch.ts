import { loadDetails, stateChangeEvent, updateScore } from './displayUpdate';
import { clearActionEvents, env, updatePositions } from './env';
import { browserStorage } from './browserStorage';
import { defineActionEvents } from './events';
import { viewManager } from './viewManager';
import { isJSON } from './utilities';
import { UUID } from './UUID';
// Use v3 UMO - v4 testing done via env.matchUp shadow
import matchObject from '@tennisvisuals/universal-match-object';
import { Match as MatchV4 } from '@tennisvisuals/universal-match-object/v4-umo';

function initializeLegacyMatch(match_data: any) {
  env.match.reset();
  env.match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
  env.match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: '2' });
  
  if (match_data.match && !match_data.match.muid) {
    match_data.match.muid = UUID();
  }
}

function loadMatchMetadata(match_data: any) {
  if (match_data.match) {
    env.match.metadata.defineMatch(match_data.match);
  }
  if (match_data.first_service) env.match.set.firstService(match_data.first_service);
  if (match_data.tournament) env.match.metadata.defineTournament(match_data.tournament);
  if (match_data.format) {
    env.match.format.settings(match_data.format);
    const mdFormat = document.getElementById('md_format');
    if (mdFormat) mdFormat.innerHTML = match_data.format.name;
  }
}

function loadLegacyPlayers(players: any[]) {
  console.log('[HVE] Loading', players.length, 'legacy players into v3 and v4');
  players.forEach((player: any, index: number) => {
    const fullName = player.participantName || player.name || `Player ${index + 1}`;
    const nameParts = fullName.trim().split(/\s+/);
    const standardGivenName = nameParts[0] || '';
    const standardFamilyName = nameParts.slice(1).join(' ') || '';
    const sideNumber = index + 1;

    env.match.metadata.updateParticipant({
      sideNumber,
      person: { standardGivenName, standardFamilyName },
    });

    try {
      env.matchUp.metadata.updateParticipant({
        sideNumber,
        person: { standardGivenName, standardFamilyName },
      });
    } catch (e) {
      console.error('[HVE] V4 updateParticipant (legacy) FAILED:', e);
    }
  });
  console.log('[HVE] Finished loading legacy players into v3 and v4');
}

function loadPoints(points: any[], context: string) {
  console.log(`[HVE] Loading ${points.length} ${context} points into both v3 and v4`);
  points.forEach((point: any, index: number) => {
    env.match.addPoint(point);
    try {
      env.matchUp.addPoint(point);
    } catch (e) {
      console.error(`[HVE] V4 addPoint during ${context} load failed at index`, index, ':', e);
    }
  });
  console.log(`[HVE] Finished loading ${context} points into v3 and v4`);
}

function initializeTODSMatch(savedFormat: string) {
  console.log('[HVE] loadMatch creating new v3 match with format:', savedFormat);
  env.match = matchObject.Match({ matchUpFormat: savedFormat });
  console.log('[HVE] loadMatch creating new v4 matchUp with format:', savedFormat);
  env.matchUp = MatchV4({ matchUpFormat: savedFormat });

  console.log('[HVE] Defining default players in v3 and v4');
  env.match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
  env.match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: '2' });
  env.matchUp.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
  env.matchUp.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: '2' });
}

function loadTODSSides(sides: any[]) {
  console.log('[HVE] Loading', sides.length, 'participants from TODS into v3 and v4');
  sides.forEach((side: any) => {
    const participant = side.participant;
    if (!participant) return;

    const givenName = participant.person?.standardGivenName || '';
    const familyName = participant.person?.standardFamilyName || '';

    env.match.metadata.updateParticipant({
      sideNumber: side.sideNumber,
      person: { standardGivenName: givenName, standardFamilyName: familyName },
    });

    try {
      env.matchUp.metadata.updateParticipant({
        sideNumber: side.sideNumber,
        person: { standardGivenName: givenName, standardFamilyName: familyName },
      });
    } catch (e) {
      console.error('[HVE] V4 updateParticipant FAILED:', e);
    }
  });
  console.log('[HVE] Finished loading participants into v3 and v4');
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

  env.match.metadata.timestamps(true);

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
