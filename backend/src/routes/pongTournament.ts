import { FastifyInstance } from 'fastify';
import { PlayerService } from '../db/playerService';
import db from '../db/initDb';

export default async function tournamentJoinRoutes(fastify: FastifyInstance) {
  // Join tournament
  fastify.post('/join', async (request, reply) => {
    try {
      const { tournament_id, player_id } = request.body as {
        tournament_id: number;
        player_id: number;
      };

      // Check if player exists
      const player = PlayerService.getPlayerById(player_id);
      if (!player) {
        return reply.status(404).send({
          error: 'Player not found'
        });
      }

      // Check if tournament exists and is open
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournament_id);
      if (!tournament) {
        return reply.status(404).send({
          error: 'Tournament not found'
        });
      }

      if (tournament.status !== 'waiting') {
        return reply.status(400).send({
          error: 'Tournament is not accepting new players'
        });
      }

      if (tournament.current_players >= tournament.max_players) {
        return reply.status(400).send({
          error: 'Tournament is full'
        });
      }

      // Check if player is already in tournament
      const existingEntry = db.prepare(
        'SELECT * FROM tournament_players WHERE tournament_id = ? AND player_id = ?'
      ).get(tournament_id, player_id);

      if (existingEntry) {
        return reply.status(409).send({
          error: 'Player is already in this tournament'
        });
      }

      // Add player to tournament
      const insertStmt = db.prepare(`
        INSERT INTO tournament_players (tournament_id, player_id)
        VALUES (?, ?)
      `);
      
      const updateStmt = db.prepare(`
        UPDATE tournaments
        SET current_players = current_players + 1
        WHERE id = ?
      `);

      insertStmt.run(tournament_id, player_id);
      updateStmt.run(tournament_id);

      return reply.send({
        success: true,
        message: 'Player joined tournament successfully'
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to join tournament',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get tournament players
  fastify.get('/:tournament_id/players', async (request, reply) => {
    try {
      const { tournament_id } = request.params as { tournament_id: string };
      
      const players = db.prepare(`
        SELECT p.*, tp.joined_at
        FROM players p
        JOIN tournament_players tp ON p.id = tp.player_id
        WHERE tp.tournament_id = ?
        ORDER BY tp.joined_at ASC
      `).all(parseInt(tournament_id));

      return reply.send({
        success: true,
        data: players
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch tournament players',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}