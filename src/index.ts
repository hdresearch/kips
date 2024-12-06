#! /usr/bin/env node
import { Command } from "commander";
import { join } from "path";
import os from "os";
import { existsSync, mkdirSync } from "fs";
import { getDb } from "./lib/index.js";
import { createImportCommand } from "./commands/import.js";
import { createServer } from "./mcp.js";
import { getConfigCommand } from "./commands/config.js";

// db init
const dbPath = join(os.homedir(), '.config', 'kips');
if (!existsSync(dbPath)) {
    mkdirSync(dbPath, { recursive: true });
}

// 'true' flag is for initialising the database
const db = getDb(true);
db.exec('CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, username TEXT, password TEXT, url TEXT, notes TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, objective TEXT, progressAssessment TEXT, completed BOOLEAN)');
db.exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, content TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS conversations (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, content TEXT)');
db.exec('CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, name TEXT NOT NULL UNIQUE)');
db.exec('CREATE TABLE IF NOT EXISTS noteTag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, noteId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY(noteId) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY(tagId) REFERENCES tags(id) ON DELETE CASCADE, UNIQUE(noteId, tagId))');
db.exec('CREATE TABLE IF NOT EXISTS taskTag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, taskId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE, FOREIGN KEY(tagId) REFERENCES tags(id) ON DELETE CASCADE, UNIQUE(taskId, tagId))');
db.exec('CREATE TABLE IF NOT EXISTS conversationTag (id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, conversationId INTEGER NOT NULL, tagId INTEGER NOT NULL, FOREIGN KEY(conversationId) REFERENCES conversations(id) ON DELETE CASCADE, FOREIGN KEY(tagId) REFERENCES tags(id) ON DELETE CASCADE, UNIQUE(conversationId, tagId))');
// triggers for updating timestamps
db.exec(`CREATE TRIGGER IF NOT EXISTS notes_update_timestamp AFTER UPDATE ON notes BEGIN UPDATE notes SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id; END`);
db.exec(`CREATE TRIGGER IF NOT EXISTS tasks_update_timestamp AFTER UPDATE ON tasks BEGIN UPDATE tasks SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id; END`);
db.exec(`CREATE TRIGGER IF NOT EXISTS conversations_update_timestamp AFTER UPDATE ON conversations BEGIN UPDATE conversations SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id; END`);
// indexes for tags and combinations
db.exec(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_noteTag_noteId ON noteTag(noteId, tagId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_taskTag_taskId ON taskTag(taskId, tagId)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_conversationTag_conversationId ON conversationTag(conversationId, tagId)`);
db.close();

// cli init
const program = new Command();
program.name("kips").version("0.0.1").description("Personal data storage for models and the HDR platform.");
program.addCommand(createImportCommand());
program.addCommand(createServer());
program.addCommand(getConfigCommand());
program.parse(process.argv);