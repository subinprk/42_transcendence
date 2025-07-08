import { GameState, Player, Ball } from '../../models/class';
import { FastifyInstance } from 'fastify';

const games = new Map<string, GameState>();

export function createGame(player1: string, player2: string): GameState{
	const id = `game_${Date.now()}`;
	
	const p1 = new Player(player1);
	const p2 = new Player(player2);
	
	return new GameState(id, p1, p2);
}

export function updateStatus(game: GameState) {
	if (!game) return;

	if (game.state === 'playing') {
		game.ball.move();
		// Check for collisions with paddles and walls
		game.bounceWall();
		// Check for paddle collisions
		game.bouncePaddle();
		// Check for win conditions
		game.reachEnd();
	}
	if (game.state === 'player1_wins' || game.state === 'player2_wins') {
		game.state = 'waiting'; // Reset to waiting state after a win
	}
}