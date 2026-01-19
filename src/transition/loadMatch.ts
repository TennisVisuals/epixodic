import { loadDetails, stateChangeEvent, updateScore } from './displayUpdate';
import { clearActionEvents, env, matchUp, updatePositions } from './env';
import { browserStorage } from './browserStorage';
import { defineActionEvents } from './events';
import { viewManager } from './viewManager';
import { isJSON } from './utilities';
import { UUID } from './UUID';

export function loadMatch(match_id: string, view = 'entry') {
  if (!match_id) {
    viewManager('entry');
    return;
  }

  const json = browserStorage.get(match_id);
  const match_data = json && isJSON(json) && match_id ? JSON.parse(browserStorage.get(match_id) ?? '[]') : undefined;

  if (!match_data) {
    // No match to load, don't set loading_match flag
    viewManager('entry');
    return;
  }

  // Prevent updateMatchArchive from saving during load
  env.loading_match = true;

  // Detect format from STORAGE: TODS (has matchUpId) vs Legacy (has muid)
  const isLegacyStorage = match_data.muid && !match_data.matchUpId;
  
  // Note: Don't reset here for TODS format - we'll reset with correct format later
  // For legacy format, we still need the initial reset
  if (isLegacyStorage) {
    env.match.reset();
    // Initialize default participants after reset (required for updateParticipant to work)
    env.match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
    env.match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: '2' });
  }

  // reduce overhead by turning off matchObject state change events;
  clearActionEvents();
  browserStorage.set('current_match', match_id);
  if (match_data.match) {
    if (!match_data.match.muid) {
      match_data.match.muid = UUID();
      browserStorage.remove(match_id);
    }
    env.match.metadata.defineMatch(match_data.match);
  }
  if (match_data.first_service) env.match.set.firstService(match_data.first_service);
  if (match_data.tournament) env.match.metadata.defineTournament(match_data.tournament);
  if (match_data.format) {
    env.match.format.settings(match_data.format);
    const mdFormat = document.getElementById('md_format');
    if (mdFormat) mdFormat.innerHTML = match_data.format.name;
  }

  // Load match points if they exist
  if (match_data.points && match_data.points.length > 0) {
    match_data.points.forEach((point: any) => env.match.addPoint(point));
  }

  // turn on timestamps *after* loading all points
  env.match.metadata.timestamps(true);

  if (isLegacyStorage) {
    // Convert legacy storage to TODS format in UMO

    // Load players from legacy format
    if (match_data.players) {
      match_data.players.forEach((player: any, index: number) => {
        const fullName = player.participantName || player.name || `Player ${index + 1}`;
        const nameParts = fullName.trim().split(/\s+/);
        const standardGivenName = nameParts[0] || '';
        const standardFamilyName = nameParts.slice(1).join(' ') || '';

        const sideNumber = index + 1; // Convert legacy index to TODS sideNumber
        env.match.metadata.updateParticipant({
          sideNumber,
          person: { standardGivenName, standardFamilyName },
        });
      });
    }

    // Load points from legacy locations
    const legacyPoints = match_data._appData?.points || match_data.points;
    if (legacyPoints) {
      legacyPoints.forEach((point: any) => {
        env.match.addPoint(point.winner);
      });
    }
  } else {
    // Load TODS format from storage (already TODS-compliant)

    // CRITICAL: Must rebuild match with correct format BEFORE loading points
    const savedFormat = match_data.matchUpFormat || 'SET3-S:6/TB7';
    
    // Reset and rebuild with the saved format
    env.match.reset();
    env.match.format.changeFormat(savedFormat);

    // CRITICAL: After reset(), must DEFINE participants before updating them
    // Initialize default participants (reset cleared them)
    env.match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: '1' });
    env.match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: '2' });

    // Now load actual participants from TODS sides
    if (match_data.sides) {
      match_data.sides.forEach((side: any) => {
        const participant = side.participant;
        if (!participant) return;

        const givenName = participant.person?.standardGivenName || '';
        const familyName = participant.person?.standardFamilyName || '';

        env.match.metadata.updateParticipant({
          sideNumber: side.sideNumber,
          person: {
            standardGivenName: givenName,
            standardFamilyName: familyName,
          },
        });
      });
    }

    // Load points from TODS score.points
    const todsPoints = match_data.score?.points;
    if (todsPoints) {
      // UMO doesn't have a restore() method - need to replay points via addPoint()
      todsPoints.forEach((point: any) => {
        // Replay the point by calling addPoint with the winner
        env.match.addPoint(point.winner);
      });
    }
  }

  // After load/conversion, UMO is always TODS format
  const loadedPlayers = env.match.metadata.players();

  updatePositions();
  updateScore();

  loadDetails();
  stateChangeEvent();
  defineActionEvents();

  // Re-enable saving after load is complete
  env.loading_match = false;
  viewManager(view);
}
