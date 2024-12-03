import Database from 'better-sqlite3';
import { join } from 'path';
import os from 'os';

export function getDb(init = false) {
    const dbPath = join(os.homedir(), '.config', 'kips');
    const db = new Database(join(dbPath, 'kips.db'), { fileMustExist: !init });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
}