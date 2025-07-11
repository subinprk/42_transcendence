// Entry file of the pong game server

import Fastify from 'fastify';
import { GameState, Player, Ball } from 'models/class';
import { createGame, updateStatus } from 'src/utils/gameManager';
import gameRoutes from './utils/game';

const server = Fastify({logger: true});
server.register(gameRoutes, {prefix: '/game'});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Pong game server is running' };
});

// WebSocket for real-time movement
server.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'move') {
          const { gameId, player, direction } = data;
          // Handle movement here
          console.log(`Player ${player} moving ${direction} in game ${gameId}`);
          
          // Send confirmation back
          connection.send(JSON.stringify({
            type: 'move_confirmed',
            gameId,
            player,
            direction
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });
});

server.listen({port: 5000, host: '0.0.0.0'}, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});