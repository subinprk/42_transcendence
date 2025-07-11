import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createGame, updateStatus, getGame, startGame, movePaddle } from './gameManager';

interface CreateGameRequest {
  player1: string;
  player2: string;
}

interface MoveRequest {
  gameId: string;
  player: 'player1' | 'player2';
  direction: 'up' | 'down';
}

async function gameRoutes(fastify: FastifyInstance) {
  // Create a new game
  fastify.post<{ Body: CreateGameRequest }>('/create', async (request, reply) => {
    const { player1, player2 } = request.body;
    
    if (!player1 || !player2) {
      return reply.status(400).send({ error: 'Both player1 and player2 are required' });
    }
    
    const game = createGame(player1, player2);
    return { gameId: game.id, message: 'Game created successfully' };
  });

  // Get game state
  fastify.get<{ Params: { gameId: string } }>('/state/:gameId', async (request, reply) => {
    const { gameId } = request.params;
    const game = getGame(gameId);
    
    if (!game) {
      return reply.status(404).send({ error: 'Game not found' });
    }
    
    return game;
  });

  // Start a game
  fastify.post<{ Body: { gameId: string } }>('/start', async (request, reply) => {
    const { gameId } = request.body;
    const success = startGame(gameId);
    
    if (!success) {
      return reply.status(400).send({ error: 'Could not start game' });
    }
    
    return { message: 'Game started successfully' };
  });

  // Move paddle
  fastify.post<{ Body: MoveRequest }>('/move', async (request, reply) => {
    const { gameId, player, direction } = request.body;
    const game = getGame(gameId);
    
    if (!game) {
      return reply.status(404).send({ error: 'Game not found' });
    }
    
    if (player === 'player1') {
      game.player1.move(direction);
    } else {
      game.player2.move(direction);
    }
    
    return { message: 'Paddle moved successfully' };
  });

  // Update game (simulate one frame)
  fastify.post<{ Body: { gameId: string } }>('/update', async (request, reply) => {
    const { gameId } = request.body;
    const game = getGame(gameId);
    
    if (!game) {
      return reply.status(404).send({ error: 'Game not found' });
    }
    
    updateStatus(game);
    return { message: 'Game updated successfully', state: game };
  });
}

export default gameRoutes;
