import {FastifyInstance} from 'fastify';
import {PlayerService, Player} from '../db/playerService';

export default async function playerRoutes(fastify: FastifyInstance) {
  // Create a new player
  fastify.post('/create', async (request, reply) => {
    try {
      const playerData = request.body as Omit<Player, 'id'>;
      
      // Validate required fields
      if (!playerData.username || !playerData.email || !playerData.display_name) {
        return reply.status(400).send({
          error: 'Missing required fields: username, email, display_name'
        });
      }

      // Check if player already exists
      const existingPlayer = PlayerService.getPlayerByUsername(playerData.username);
      if (existingPlayer) {
        return reply.status(409).send({
          error: 'Player with this username already exists'
        });
      }

      const newPlayer = PlayerService.createPlayer(playerData);
      return reply.status(201).send({
        success: true,
        data: newPlayer
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to create player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all players
  fastify.get('/list', async (request, reply) => {
    try {
      const players = PlayerService.getAllPlayers();
      return reply.send({
        success: true,
        data: players
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch players',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get player by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const player = PlayerService.getPlayerById(parseInt(id));
      
      if (!player) {
        return reply.status(404).send({
          error: 'Player not found'
        });
      }

      return reply.send({
        success: true,
        data: player
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update player stats
  fastify.put('/:id/stats', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { wins, losses, rank_points } = request.body as {
        wins: number;
        losses: number;
        rank_points: number;
      };

      const success = PlayerService.updatePlayerStats(
        parseInt(id),
        wins,
        losses,
        rank_points
      );

      if (!success) {
        return reply.status(404).send({
          error: 'Player not found or update failed'
        });
      }

      return reply.send({
        success: true,
        message: 'Player stats updated successfully'
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to update player stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete player
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const success = PlayerService.deletePlayer(parseInt(id));

      if (!success) {
        return reply.status(404).send({
          error: 'Player not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Player deleted successfully'
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to delete player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}