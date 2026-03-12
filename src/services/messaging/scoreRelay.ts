import { io, Socket } from 'socket.io-client';

const RELAY_URL = import.meta.env.VITE_RELAY_URL || 'http://localhost:8384';

let trackerSocket: Socket | null = null;
let listenerSocket: Socket | null = null;

// --- Tracker connection (for sending scores from epixodic as a mobile tracker) ---

export function connectTracker(): Socket {
  if (trackerSocket?.connected) return trackerSocket;

  trackerSocket = io(`${RELAY_URL}/tracker`, {
    transports: ['websocket'],
    autoConnect: true,
  });

  trackerSocket.on('connect', () => {
    console.log('[scoreRelay] tracker connected');
  });

  trackerSocket.on('ack', (data: any) => {
    console.log('[scoreRelay] ack:', data);
  });

  trackerSocket.on('disconnect', () => {
    console.log('[scoreRelay] tracker disconnected');
  });

  return trackerSocket;
}

export function sendScore(update: {
  matchUpId: string;
  tournamentId?: string;
  score: any;
  point?: any;
  matchUpStatus?: string;
  winningSide?: number;
}): void {
  if (!trackerSocket?.connected) {
    connectTracker();
  }
  trackerSocket?.emit('score', update);
}

export function sendHistory(history: {
  matchUpId: string;
  tournamentId?: string;
  provider?: string;
  matchUpFormat?: string;
  points: any[];
  score?: any;
  sides?: any[];
}): void {
  if (!trackerSocket?.connected) {
    connectTracker();
  }
  trackerSocket?.emit('history', history);
}

// --- Listener connection (for receiving live scores as a display/dashboard) ---

export function connectListener(): Socket {
  if (listenerSocket?.connected) return listenerSocket;

  listenerSocket = io(`${RELAY_URL}/live`, {
    transports: ['websocket'],
    autoConnect: true,
  });

  listenerSocket.on('connect', () => {
    console.log('[scoreRelay] listener connected');
  });

  listenerSocket.on('disconnect', () => {
    console.log('[scoreRelay] listener disconnected');
  });

  return listenerSocket;
}

export function subscribeToMatch(
  matchUpId: string,
  onScore: (update: any) => void,
  onHistory?: (history: any) => void,
): () => void {
  const socket = connectListener();

  socket.emit('subscribe', matchUpId);
  socket.on('score', onScore);
  if (onHistory) socket.on('history', onHistory);

  // Return unsubscribe function
  return () => {
    socket.emit('unsubscribe', matchUpId);
    socket.off('score', onScore);
    if (onHistory) socket.off('history', onHistory);
  };
}

export function subscribeToAll(
  onScore: (update: any) => void,
  onActive?: (matchIds: string[]) => void,
): () => void {
  const socket = connectListener();

  socket.emit('subscribe:all');
  socket.on('score', onScore);
  if (onActive) socket.on('active', onActive);

  return () => {
    socket.emit('unsubscribe:all');
    socket.off('score', onScore);
    if (onActive) socket.off('active', onActive);
  };
}

export function disconnectAll(): void {
  trackerSocket?.disconnect();
  listenerSocket?.disconnect();
  trackerSocket = null;
  listenerSocket = null;
}
