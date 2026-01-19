import { default_players, device, env } from './env';
import { broadcasting, coms } from './coms';

export function broadcastScore(action?: any) {
  action = action || env.match.history.lastPoint();
  const players = env.match.metadata.players();

  // don't publish if the player names haven't been changed
  const pub = players[0].participantName != default_players[0] && players[1].participantName != default_players[1];

  // Broadcast disabled for standalone app
  if (false && pub && broadcasting()) {
    const coords = device.geoposition.coords || {};
    const tournament = env.match.metadata.defineTournament();
    const match_meta = env.match.metadata.defineMatch();
    const match_message = {
      tournament,
      match: env.match.metadata.defineMatch(),
      event: { euid: match_meta.euid },
      status: env.match.status,
      players: env.match.metadata.players(),
      score: env.match.score(),
      point: action.point,
      serving: env.match.nextTeamServing(),
      complete: env.match.complete(),
      winner: env.match.winner(),
      geoposition: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      undo: typeof action == 'string' && action == 'Undo',
    };
    sendScoreUpdate(match_message);
  }
}

let next_update: any;
let last_timeout: any;
let last_update = 0;
const update_window = 10000;

function sendScoreUpdate(update: any) {
  const now = Date.now();
  next_update = update;

  if (now - last_update > update_window) {
    coms.socket.emit('mh', { type: 'score', payload: { next_update } });
    last_update = now;
  } else {
    if (last_timeout) clearTimeout(last_timeout);
    const wait_time = update_window - (now - last_update);
    last_timeout = setTimeout(function () {
      coms.socket.emit('mh', { type: 'score', payload: { next_update } });
      last_update = now;
    }, wait_time);
  }
}
