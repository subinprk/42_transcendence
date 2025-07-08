type Player = {
	alias: string;
	score: number;
	paddleY : number;
};

type Ball = {
	x: number;
	y: number;
	dx: number;
	dy: number;
};

type GameState = {
	id : string;
	player1: Player;
	player2: Player;
	ball: Ball;
	state : 'waiting' | 'playing' | 'finished';
};