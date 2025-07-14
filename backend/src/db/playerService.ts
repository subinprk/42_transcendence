import db from './initDb';

export interface Player {
  id?: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  wins?: number;
  losses?: number;
  rank_points?: number;
  created_at?: string;
  updated_at?: string;
}

export class PlayerService {

	static createPlayer(player: Omit<Player, 'id'>){
		const createPlayer(player: Omit<Player, 'id'>): Player{
			const stmt = db.prepare(`
				INSERT INTO players (username, email, display_name, avatar_url, wins, losses, rank_points)
				VALUES (?, ?, ?, ?, ?, ?, ?)`
			);

			const result = stmt.run(
				player.username,
				player.email,
				player.display_name,
				player.avatar_url || null,
				player.wins || 0,
				player.losses || 0,
				player.rank_points || 1000
			)

			return this.getPlayerById(result.lastInsertRowid as number)!;
		}

	}

	static getPlayerById(id: number): Player | null {
		const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
		return stmt.get(id) as Player | null;
	}

	static getPlayerByUsername(username: string): Player | null {
		const stmt = db.prepare('SELECT * FROM players WHERE username = ?');
		return stmt.get(username) as Player | null;
	}

	static getPlayerByEmail(email: string): Player | null {
		const stmt = db.prepare('SELECT * FROM players WHERE email = ?');
		return stmt.get(email) as Player | null;
	}

	static getAllPlayers(): Player[] {
		const stmt = db.prepare('SELECT * FROM players ORDER BY rank_points DESC');
		return stmt.all() as Player[];
	}

	statoc updatePlayerStats(playerId: number, wins: number, losses: number, rankPoints: number): boolean {
		const stmt = db.prepare(`
			UPDATE players
			SET wins = wins + ?, losses = losses + ?, rank_points = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`);

		const result = stmt.run(wins, losses, rankPoints, playerId);
		return result.changes > 0;
	}

	static deletePlayer(id: number): boolean {
		const stmt = db.prepare('DELETE FROM players WHERE id = ?');
		const result = stmt.run(id);
		return result.changes > 0;
	}
}