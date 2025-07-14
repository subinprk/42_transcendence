import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { registerGameRoutes } from './game';
import playerRoutes from './src/routes/pongPlayer';
import tournamentJoinRoutes from './src/routes/pongTournament';
import { PlayerService } from './src/db/playerService';

import { getAllGames, updateStatus } from './game/pong/utils/gameManager';
import { broadcastPongGameState } from './game/pong/websocket/gameSocket';

// Import your existing backend routes
// import userRoutes from './src/routes/users';
// import authRoutes from './src/routes/auth';

const server = Fastify({ logger: true });

// Store WebSocket connections by game ID
const gameConnections = new Map<string, Set<any>>();

// Register WebSocket support
server.register(fastifyWebsocket);

// Manual CORS headers
server.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    reply.status(200).send();
    return;
  }
});

// Register player routes
server.register(playerRoutes, { prefix: '/api/players' });
// Register tournament routes
server.register(tournamentJoinRoutes, { prefix: '/api/tournament' });
// Register game routes
server.register(async (fastify) => {
  await registerGameRoutes(fastify, gameConnections);
}, { prefix: '/game' });

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    message: 'Transcendence backend is running',
    services: ['pong-game', 'users', 'auth']
  };
});

function startGameLoop(){
  const GAME_TICK_RATE = 16; // 60 FPS
  const TICK_INTERVAL = 1000 / GAME_TICK_RATE; 

  setInterval(async () => {
    try {
      // Import game functions dynamically to avoid circular imports
      const games = getAllGames();

      // console.log(`[GAME LOOP] Running at ${new Date().toLocaleTimeString()}.${new Date().getMilliseconds()}`);
      // console.log(`[GAME LOOP] Found ${games.length} games`);

      games.forEach(game => {
        if (game.state === 'playing') {
          updateStatus(game);

          console.log(`[GAME LOOP] Game ${game.id} is in playing state`);
          const connections = gameConnections.get(game.id);
          if (connections && connections.size > 0) {
            broadcastPongGameState(game.id, game, gameConnections);
            console.log(`[GAME LOOP] Broadcasting game state for game ${game.id} - Ball at (${game.ball.x}, ${game.ball.y})`);
          } else {
            console.log(`[GAME LOOP] No connections for game ${game.id}, skipping broadcast`);
          } //else lines for debugging purposes
        }
        else if (game.state === 'player1_wins' || game.state === 'player2_wins') {
          // Reset game state after a win
          broadcastPongGameState(game.id, game, gameConnections);
        }
      });
    }catch (error) {
      console.error('Error in game loop:', error);
    }
  }, TICK_INTERVAL);
  console.log(`Game loop started with tick rate of ${GAME_TICK_RATE} FPS`);
}


// Start server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Transcendence Backend started on port 3000');
    console.log('Pong game available at /game/pong/*');
    startGameLoop(); // Start the game loop for real-time updates
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

server.ready(() => {
  console.log(server.printRoutes());
});

start();