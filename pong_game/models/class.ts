export class Player {
	alias: string;
	paddle: number = 50;
	paddleLen: number = 3;
	score: number = 0;

	constructor(alias: string) {
		this.alias = alias;
	}

	move(direction: 'up' | 'down') {
		if (direction === 'up') {
			this.paddle = Math.max(0, this.paddle - 3);
		} else if (direction === 'down') {
			this.paddle = Math.min(100, this.paddle + 3);
		}
	}

	incrementScore() {
		this.score += 1;
	}

}

export class Ball {
	x: number = 50;
	y: number = 50;
	dx: number = 1;
	dy: number = 1;

	move() {
		this.x += this.dx;
		this.y += this.dy;
	}

	bounce_paddle() {
		this.dx *= -1;
	}

	bounce_wall() {
		this.dy *= -1;
	}

	reset() {
		this.x = 50;
		this.y = 50;
		this.dx = 1;
		this.dy = 1;
	}
}

export class GameState {
	id: string;
	player1: Player;
	player2: Player;
	ball: Ball;
	state: 'waiting' | 'playing' | 'player1_wins' | 'player2_wins';

	constructor(id: string, player1: Player, player2: Player) {
		this.id = id;
		this.player1 = player1;
		this.player2 = player2;
		this.ball = new Ball();
		this.state = 'waiting';
	}

	start() {
		this.state = 'playing';
		this.ball.reset();
	}

	pause() {
		if (this.state === 'playing') {
			this.state = 'waiting';
		}
	}

	resume() {
		if (this.state === 'waiting') {
			this.state = 'playing';
		}
	}

	bounceWall() {
		if (this.ball.y <= 0 || this.ball.y >= 100) {
			this.ball.bounce_wall();
		}
	}
	bouncePaddle() {
		if (this.ball.x <= 5 && this.ball.y >= this.player1.paddle - this.player1.paddleLen
			&& this.ball.y <= this.player1.paddle + this.player1.paddleLen) {
			this.ball.bounce_paddle();
		} else if (this.ball.x >= 95 && this.ball.y >= this.player2.paddle - this.player2.paddleLen
			&& this.ball.y <= this.player2.paddle + this.player2.paddleLen) {
			this.ball.bounce_paddle();
		}
	}
	reachEnd() {
		if (this.ball.x >= 100) {
			this.player1.incrementScore();
			this.ball.reset();
			this.state = 'player1_wins';
		} else if (this.ball.x <= 0) {
			this.player2.incrementScore();
			this.ball.reset();
			this.state = 'player2_wins';
		}
	}
}
