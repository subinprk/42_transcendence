import { FastifyInstance } from 'fastify';
import { getGame, updateStatus } from '../utils/gameManager';

export function setupPongWebSocket(fastify: FastifyInstance, gameConnections: Map<string, Set<any>>) {
  // WebSocket for real-time pong game updates
  fastify.get('/pong/ws/:gameId', { websocket: true }, (connection, req) => {
    const gameId = req.params.gameId;
    
    // Add connection to game room
    if (!gameConnections.has(gameId)) {
      gameConnections.set(gameId, new Set());
    }
    gameConnections.get(gameId)!.add(connection);
    
    console.log(`Player connected to pong game ${gameId}`);
    
    // Handle incoming messages from client
    connection.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'move') {
          const game = getGame(gameId);
          if (game) {
            if (data.player === 'player1') {
              game.player1.move(data.direction);
            } else if (data.player === 'player2') {
              game.player2.move(data.direction);
            }
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
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
      console.log(`Player disconnected from pong game ${gameId}`);
    });
  });
}

export function broadcastPongGameState(gameId: string, game: any, gameConnections: Map<string, Set<any>>) {
  const connections = gameConnections.get(gameId);
  if (!connections || connections.size === 0) return;

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

  connections.forEach(connection => {
    try {
      connection.send(JSON.stringify(gameState));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  });
}