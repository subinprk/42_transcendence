// Entry file of the pong game server

import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
//cors is for debugging in html file
import { GameState, Player, Ball } from '../models/class';
import { createGame, updateStatus, getGame } from './utils/gameManager';
import gameRoutes from './routes/game';

const server = Fastify({logger: true});

// Store WebSocket connections by game ID
const gameConnections = new Map<string, Set<any>>();

// Register WebSocket support
server.register(fastifyWebsocket);

// for debugging purposes, CORS is enabled to allow requests from localhost:3000
server.register(fastifyCors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://', 'null'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

server.register(gameRoutes, {prefix: '/game'});
//prefix: '/game' allows all game-related routes to be grouped under /game
// things can be added to this prefix like /game/create, /game/state, etc.

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Pong game server is running' };
});

// WebSocket for real-time game updates
server.register(async function (fastify) {
  fastify.get('/ws/:gameId', { websocket: true }, (connection, req) => {
    const gameId = req.params.gameId;
    
    // Add connection to game room
    if (!gameConnections.has(gameId)) {
      gameConnections.set(gameId, new Set());
    }
    gameConnections.get(gameId)!.add(connection);
    
    console.log(`Player connected to game ${gameId}`);
    
    // Handle incoming messages from client
    connection.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'move') {
          const { player, direction } = data;
          const game = getGame(gameId);
          
          if (game) {
            // Update player position
            if (player === 'player1') {
              game.player1.move(direction);
            } else if (player === 'player2') {
              game.player2.move(direction);
            }
            
            // Broadcast updated game state immediately
            broadcastGameState(gameId, game);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Remove connection when client disconnects
    connection.on('close', () => {
      const connections = gameConnections.get(gameId);
      if (connections) {
        connections.delete(connection);
        if (connections.size === 0) {
          gameConnections.delete(gameId);
        }
      }
      console.log(`Player disconnected from game ${gameId}`);
    });
  });
});

// Function to broadcast game state to all connected clients
function broadcastGameState(gameId: string, game: GameState) {
  const connections = gameConnections.get(gameId);
  if (connections) {
    const gameState = {
      type: 'game_state',
      gameId: gameId,
      ball: {
        x: game.ball.x,
        y: game.ball.y
      },
      player1: {
        alias: game.player1.alias,
        paddle: game.player1.paddle,
        score: game.player1.score
      },
      player2: {
        alias: game.player2.alias,
        paddle: game.player2.paddle,
        score: game.player2.score
      },
      state: game.state
    };
    
    const message = JSON.stringify(gameState);
    connections.forEach(connection => {
      try {
        connection.send(message);
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    });
  }
}

// Game loop - broadcasts game state every 16ms (~60 FPS)
setInterval(() => {
  gameConnections.forEach((connections, gameId) => {
    if (connections.size > 0) {
      const game = getGame(gameId);
      if (game && game.state === 'playing') {
        // Update game physics
        updateStatus(game);
        
        // Broadcast updated state to all players
        broadcastGameState(gameId, game);
      }
    }
  });
}, 16); // 60 FPS (1000ms / 60 = ~16ms)

server.listen({port: 5000, host: '0.0.0.0'}, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});