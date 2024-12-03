import { Command } from "commander";
import Database from "better-sqlite3";
import { join } from "path";
import os from "os";
import { existsSync, mkdirSync } from "fs";

// db init
const dbPath = join(os.homedir(), '.config', 'kips');
if (!existsSync(dbPath)) {
    mkdirSync(dbPath, { recursive: true });
}

const db = new Database(join(dbPath, 'kips.db'));
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.exec('CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, username TEXT, password TEXT, url TEXT, notes TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, objective TEXT, progressAssessment TEXT, completed BOOLEAN)');
db.exec('CREATE TABLE IF NOT EXISTS note (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, content TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS conversation (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, content TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS tag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, name TEXT NOT NULL UNIQUE)');
db.exec('CREATE TABLE IF NOT EXISTS noteTag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, noteId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY(noteId) REFERENCES note(id) ON DELETE CASCADE, FOREIGN KEY(tagId) REFERENCES tag(id) ON DELETE CASCADE, UNIQUE(noteId, tagId))');
db.exec('CREATE TABLE IF NOT EXISTS taskTag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, taskId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY(taskId) REFERENCES task(id) ON DELETE CASCADE, FOREIGN KEY(tagId) REFERENCES tag(id) ON DELETE CASCADE, UNIQUE(taskId, tagId))');
db.exec('CREATE TABLE IF NOT EXISTS conversationTag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, conversationId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY(conversationId) REFERENCES conversation(id) ON DELETE CASCADE, FOREIGN KEY(tagId) REFERENCES tag(id) ON DELETE CASCADE, UNIQUE(conversationId, tagId))');
// triggers for updating timestamps
db.exec(`CREATE TRIGGER IF NOT EXISTS notes_update_timestamp AFTER UPDATE ON notes BEGIN UPDATE notes SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id; END`);
db.exec(`CREATE TRIGGER IF NOT EXISTS tasks_update_timestamp AFTER UPDATE ON tasks BEGIN UPDATE tasks SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id; END`);
db.exec(`CREATE TRIGGER IF NOT EXISTS conversations_update_timestamp AFTER UPDATE ON conversations BEGIN UPDATE conversations SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id; END`);
// indexes for tags and combinations
db.exec(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_noteTag_noteId ON noteTag(noteId, tagId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_taskTag_taskId ON taskTag(taskId, tagId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_conversationTag_conversationId ON conversationTag(conversationId, tagId)`);

// cli init
const program = new Command();
program.name("kips").version("0.0.1").description("Personal data storage for models and the HDR platform.");

