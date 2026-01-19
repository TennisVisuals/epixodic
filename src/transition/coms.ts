import { attemptJSONparse, formatDate, getOpponents } from './utilities';
import { getJwtTokenStorageKey } from '../config/getJwtTokenStorageKey';
import { app, env, updateAppState, updateMatchArchive } from './env';
import { loadDetails, stateChangeEvent } from './displayUpdate';
import { tmxToast } from '../services/notifications/tmxToast';
import { resetMatch } from './displayMatchArchive';
import { browserStorage } from './browserStorage';
import { viewManager } from './viewManager';
import { pulseCircle } from './pulseCircle';
import { connect } from 'socket.io-client';
import { closeModal } from './modals';
import * as d3 from 'd3';

type ComsObject = {
  socket: any;
};

function getAuthorization() {
  const token = browserStorage.get(getJwtTokenStorageKey());
  if (!token) return undefined;
  const authorization = `Bearer ${token}`;
  return { authorization };
}

export const coms: ComsObject = {
  socket: undefined,
};

export function connectSocket() {
  if ((navigator.onLine || window.location.hostname == 'localhost') && !coms.socket) {
    const server =
      window.location.hostname.startsWith('localhost') || window.location.hostname === '127.0.0.1'
        ? env.server || 'http://127.0.0.1:8383'
        : // : window.location.hostname;
          'https://courthive.net';

    console.log({ server });
    const connectionString = `${server}/mobile`;
    const connectionOptions: any = {
      transportOptions: { polling: { extraHeaders: getAuthorization() } },
      reconnectionAttempts: 'Infinity',
      'force new connection': true,
      reconnectionDelay: 1000,
      timeout: 20000,
    };
    coms.socket = connect(connectionString, connectionOptions);
    if (coms.socket) {
      coms.socket.on('connect', comsConnect);
      coms.socket.on('ack', (ack) => console.log({ ack }));
      coms.socket.on('disconnect', comsDisconnect);
      coms.socket.on('connect_error', comsError);
      coms.socket.on('history request', sendHistory);
      coms.socket.on('tmx message', receiveMatchUp);
      coms.socket.on('exception', (exeption) => console.log(exeption));
      coms.socket.on('success', (message) => console.log(message));
    }
  }
}

export function disconnectSocket() {
  if (coms.socket) {
    coms.socket.disconnect();
    coms.socket = undefined;
  }
}

export function sendHistory() {
  connectSocket();
  if (coms.socket) {
    const match = env.match.metadata.defineMatch();
    const payload = {
      matchUp: {
        tournament: env.match.metadata.defineTournament(),
        first_service: env.match.set.firstService(),
        players: env.match.metadata.players(),
        // FACTORY-FIRST: Use modern accessors
        format: {
          // @ts-ignore - UMO v3.0 modern API
          code: env.match.format.code,
          // @ts-ignore - UMO v3.0 modern API
          bestOf: env.match.format.bestOf,
          // @ts-ignore - UMO v3.0 modern API
          setsToWin: env.match.format.setsToWin,
          // @ts-ignore - UMO v3.0 modern API
          structure: env.match.format.structure
        },
        scoreboard: env.match.scoreboard(),
        points: env.match.history.points(),
        provider: env.provider,
        matchUpId: match.muid,
        match,
      },
    };
    if (match.muid) coms.socket.emit('mh', { type: 'history', payload });
  }
  closeModal();
}

function comsConnect() {
  console.log('connect');
}
function comsDisconnect() {
  console.log('socket closed');
}
function comsError() {
  tmxToast({ message: 'No server connection', intent: 'is-danger' });
  endBroadcast();
}

function receiveMatchUp(data: any) {
  if (!data?.matchUpId) {
    const message = `Invalid data`;
    return tmxToast({ message });
  }

  const auth_match = attemptJSONparse(data.data);

  updateMatchArchive();
  resetMatch(auth_match.match.muid);

  env.match.metadata.defineTournament({
    name: auth_match.tournament.name,
    tuid: auth_match.tournament.tuid,
    start_date: formatDate(auth_match.tournament.start),
  });

  env.match.metadata.defineMatch({
    euid: auth_match.event.euid,
  });

  const format = auth_match.teams && 2 === auth_match.teams[0].length ? 'doubles' : 'singles';
  const teams = getOpponents({
    sides: auth_match.teams,
    format,
  });
  // Split team names into firstName/lastName for modern TODS format
  const team0Parts = teams[0].trim().split(/\s+/);
  const team1Parts = teams[1].trim().split(/\s+/);
  
  env.match.metadata.definePlayer({ 
    index: 0, 
    firstName: team0Parts[0] || '', 
    lastName: team0Parts.slice(1).join(' ') || '' 
  });
  
  env.match.metadata.definePlayer({ 
    index: 1, 
    firstName: team1Parts[0] || '', 
    lastName: team1Parts.slice(1).join(' ') || '' 
  });

  const surface: any = auth_match.event.surface;
  if (surface) {
    const surfaces: any = {
      C: 'clay',
      H: 'hard',
      G: 'grass',
    };
    if (surfaces[surface]) {
      env.match.metadata.defineTournament({ surface: surfaces[surface] });
    }
  }

  const in_out = auth_match.event.inout;
  if (in_out) {
    const inout: any = {
      o: 'out',
      i: 'in',
    };
    if (inout[in_out]) {
      env.match.metadata.defineTournament({ in_out: inout[in_out] });
    }
  }

  loadDetails();
  stateChangeEvent();
  viewManager('entry');
}

export function broadcasting() {
  if (app.broadcast && coms.socket) return true;
  if (app.broadcast) {
    connectSocket();
  }
  return false;
}

export function startBroadcast() {
  connectSocket();
  //@ts-expect-error unknown reason
  const pc: any = pulseCircle().color_range(['white', 'white']).height(60).width(60).radius(28).stroke_width(5);
  d3.select('#startpulse').style('display', 'none');
  d3.select('#pulse').style('display', 'block').call(pc);
}

function endBroadcast() {
  app.broadcast = false;
  d3.select('#startpulse').style('display', 'flex');
  d3.select('#pulse').style('display', 'none').selectAll('svg').remove();
  disconnectSocket();
}

export function sendKey(payload: any) {
  Object.assign(payload, {
    timestamp: new Date().getTime(),
    uuuid: app.user_uuid,
  });
  if (coms.socket) {
    coms.socket.emit('mh', { type: 'key', payload });
    closeModal();
  } else {
    const message = `Connection error`;
    tmxToast({ message, intent: 'is-danger' });
  }
}

export function broadcastToggle() {
  app.broadcast = !app.broadcast;
  if (app.broadcast) {
    startBroadcast();
  } else {
    endBroadcast();
  }
  updateAppState();
}

export function broadcastStatus(status: string) {
  if (broadcasting()) {
    const muid = env.match.metadata.defineMatch().muid;
    const data: any = { muid, status };
    const tournament = env.match.metadata.defineTournament();
    data.tuid = tournament.tuid || tournament.name;
    coms.socket.emit('mh', { type: 'status', payload: data });
  }
}
