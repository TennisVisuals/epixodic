import { env, updateMatchArchive } from './env';

export function updateTournamentDetails() {
  const tournament = {};
  let attributes = ['surface', 'in_out', 'draw', 'draw_size', 'round'];

  attributes.forEach((attribute) => {
    const target_id = `tournament_${attribute}`;
    const obj: any = document.getElementById(target_id);
    if (obj.selectedIndex >= 0) {
      const value = obj.options[obj.selectedIndex].value;
      if (value) tournament[attribute] = value;
    }
  });

  attributes = ['name', 'start_date', 'tour', 'rank'];
  attributes.forEach((attribute) => {
    const target: any = document.getElementById(`tournament_${attribute}`);
    const value = target.value;
    if (value) tournament[attribute] = value.trim();
  });
  Object.assign(env.metadata.tournament, tournament);
  updateMatchArchive();
}
