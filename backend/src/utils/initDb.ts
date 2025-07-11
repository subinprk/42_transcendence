import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '../db/pong.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)){
	fs.mkdirSync(dbDir, {recursive: true})
}

const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER,
    player2_id INTEGER,
    winner_id INTEGER,
    played_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player1_id) REFERENCES users(id),
    FOREIGN KEY(player2_id) REFERENCES users(id),
    FOREIGN KEY(winner_id) REFERENCES users(id)
  );
`);

console.log('SQLite DB init: ', dbPath);

export default db;