import { GameState, Player, Ball } from '../models/class';
import { FastifyInstance } from 'fastify';

const games = new Map<string, GameState>();

export function createGame(player1: string, player2: string): GameState{
	const id = `game_${Date.now()}`;
	const p1 = new Player(player1);
	const p2 = new Player(player2);
	
	const game = new GameState(id, p1, p2);
	games.set(id, game);
	
	return game;
}

export function getGame(gameId: string): GameState | undefined {
	return games.get(gameId);
}

export function startGame(gameId: string): boolean {
	const game = games.get(gameId);
	if (game && game.state === 'waiting') {
		game.start();
		return true;
	}
	return false;
}


export function movePaddle(gameId: string, player: 'player1' | 'player2', direction: 'up' | 'down'): boolean {
	const game = games.get(gameId);
	if (!game) return false;
	
	if (player === 'player1') {
		game.player1.move(direction);
	} else {
		game.player2.move(direction);
	}
	
	return true;
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
	if (game.player1.score >= 5 || game.player2.score >= 5) {
		game.state = game.player1.score >= 5 ? 'player1_wins' : 'player2_wins';
	}
}

export function getAllGames(): GameState[] {
	return Array.from(games.values());
}

export function removeGame(gameId: string): boolean {
	return games.delete(gameId);
}

// setInterval(() => {
// 	const now = Date.now();
// 	games.forEach((game, gameId) => {
// 		if (game.state === 'player1_wins' || game.state === 'player2_wins') {
// 			const gameAge = now - parseInt(gameId.split('_')[1]);
// 			if (gameAge > 60000 * 5) // Remove games older than 60 seconds * 5
// 			{
// 				games
// 			}
