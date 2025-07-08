// Entry file of the pong game server

import Fastify from 'fastify';
// import gameRoutes from './routes/game';
import { GameState, Player, Ball } from '../models/types';
import { createGame, updateStatus } from './utils/gameManager';

const server = Fastify({logger: true});
server.register(gameRoutes, {prefix: '/game'});
server.listen({port: 5000}, (err, address) => {
	  if (err) {
	server.log.error(err);
	process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});