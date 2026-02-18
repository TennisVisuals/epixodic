import { env, updateMatchArchive, updatePositions, updateParticipant, definePlayer } from '../state/env';
import { loadDetails } from './displayUpdate';

export function updatePlayer() {
  const playerUpdate = updatePlayerDetails();

  try {
    updateParticipant(playerUpdate);
  } catch (error: any) {
    if (error.message?.includes('No participant found')) {
      // Participant doesn't exist yet, create it with definePlayer
      const index = playerUpdate.sideNumber - 1;
      const firstName = playerUpdate.person?.standardGivenName || 'Player';
      const lastName = playerUpdate.person?.standardFamilyName || String(playerUpdate.sideNumber);
      definePlayer({ index, firstName, lastName });
    } else {
      throw error;
    }
  }
  
  updatePositions(); // Refresh court positions with new player name
  loadDetails(); // CRITICAL: Refresh all player name displays in UI
  updateMatchArchive();
}

function updatePlayerDetails() {
  const sideNumber = env.edit_player + 1; // Convert index to sideNumber (0→1, 1→2)
  const player: any = { sideNumber };
  
  // Get player name and split into standardGivenName/standardFamilyName (TODS format)
  const playerNameElement: any = document.getElementById('playername');
  if (playerNameElement?.value) {
    const fullName = playerNameElement.value.trim();
    const nameParts = fullName.split(/\s+/);
    player.person = {
      standardGivenName: nameParts[0] || '',
      standardFamilyName: nameParts.slice(1).join(' ') || ''
    };
  }
  
  const attributes = ['hand', 'entry', 'seed', 'draw_position', 'ioc'];
  attributes.forEach((attribute) => {
    const target_id = `player_${attribute}`;
    const obj: any = document.getElementById(target_id);
    if (obj.selectedIndex >= 0) {
      const value = obj.options[obj.selectedIndex].value;
      if (value) player[attribute] = value;
    }
  });
  const rankElement: any = document.getElementById('player_rank');
  if (rankElement.value) player.rank = rankElement.value;
  const wtnElement: any = document.getElementById('player_wtn');
  if (wtnElement.value) player.wtn = wtnElement.value;
  const utrElement: any = document.getElementById('player_utr');
  if (utrElement.value) player.utr = utrElement.value;

  const teamElement: any = document.getElementById('team');
  if (teamElement.value) player.team = teamElement.value;
  const idElement: any = document.getElementById('playerid');
  // Note: 'id' is a custom field, will be stored in TODS extensions
  if (idElement.value) (player as any).id = idElement.value;

  return player;
}
