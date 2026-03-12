import { Server } from 'socket.io';
import { createServer } from 'http';
import { createRelay } from './relay.js';
import { configurePersistence } from './persistence.js';
import type { RelayConfig } from './types.js';

const config: RelayConfig = {
  port: parseInt(process.env.RELAY_PORT || '8384', 10),
  factoryServerUrl: process.env.FACTORY_SERVER_URL || undefined,
  persistScores: process.env.PERSIST_SCORES !== 'false',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || '*',
};

const httpServer = createServer((_req, res) => {
  // Health check endpoint
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'score-relay' }));
});

const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

if (config.persistScores && config.factoryServerUrl) {
  configurePersistence(config.factoryServerUrl);
  console.log(`[relay] persistence enabled → ${config.factoryServerUrl}`);
} else {
  console.log('[relay] persistence disabled (no FACTORY_SERVER_URL or PERSIST_SCORES=false)');
}

createRelay(io);

httpServer.listen(config.port, () => {
  console.log(`[relay] score-relay listening on port ${config.port}`);
  console.log(`[relay] tracker namespace: /tracker (mobile trackers connect here)`);
  console.log(`[relay] live namespace:    /live    (listeners subscribe here)`);
});
