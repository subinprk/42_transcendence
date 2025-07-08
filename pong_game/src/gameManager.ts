import { GameState, Player, Ball } from './types/gameTypes';

const games = new Map<string, GameState>();

function createGame(player1: string, player2: string): 