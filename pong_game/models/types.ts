export type Player = {
	alias: string;
	score: number;
	paddleY : number;
};

export type Ball = {
	x: number;
	y: number;
	dx: number;
	dy: number;
};

export type GameState = {
	id : string;
	player1: Player;
	player2: Player;
	ball: Ball;
	state : 'waiting' | 'playing' | 'finished';
};

export type MoveRequest = {
	gameId: string;
	player: 'player1' | 'player2';
	direction: 'up' | 'down';
};