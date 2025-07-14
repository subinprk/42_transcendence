import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { registerGameRoutes } from './game';

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

// Register existing backend routes
// server.register(userRoutes, { prefix: '/api/users' });
// server.register(authRoutes, { prefix: '/api/auth' });

// Register game routes
server.register(registerGameRoutes, { prefix: '/game' });

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    message: 'Transcendence backend is running',
    services: ['pong-game', 'users', 'auth']
  };
});


// Game loop for real-time updates
setInterval(() => {
  gameConnections.forEach((connections, gameId) => {
    if (connections.size > 0) {
      // Import game functions dynamically to avoid circular imports
      import('./game/pong/utils/gameManager').then(({ getGame, updateStatus }) => {
        import('./game/pong/websocket/gameSocket').then(({ broadcastPongGameState }) => {
          const game = getGame(gameId);
          if (game && game.state === 'playing') {
            updateStatus(game);
            broadcastPongGameState(gameId, game, gameConnections);
          }
        });
      });
    }
  });
}, 16); // 60 FPS

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Transcendence Backend started on port 3000');
    console.log('Pong game available at /game/pong/*');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

server.ready(() => {
  console.log(server.printRoutes());
});

start();