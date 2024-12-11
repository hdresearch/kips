import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { Tag, TagInsert } from '../types/index.js';
import { join } from 'path';
import os from 'os';

export function getDb() {
    const dbPath = join(os.homedir(), '.config', 'kips');
    const db = new Database(join(dbPath, 'kips.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
    return db;
}

function initDb(db: DatabaseType) {
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
}

export function getTagsById(db: DatabaseType, tagIds: number[]) {
    const tags = db.prepare<Partial<Tag>[]>(`SELECT * FROM tags WHERE id IN (${tagIds.join(',')})`).all();
    return tags;
}

export function submitTags(db: DatabaseType, tags: string[]): number[] {
    const tagIds = [];
    for (const tag of tags) {
        const tagResult = db.prepare<Partial<Tag>>(`SELECT id FROM tags WHERE name = @name`).get({name: tag});
        const tagId = (tagResult as { id: number })?.id;
        if (tagResult) {
            tagIds.push(tagId);
        } else {
            const insertTag = db.prepare<TagInsert>(`INSERT INTO tags (name) VALUES (@name)`);
            insertTag.run({name: tag});
            const tagResult = db.prepare<Partial<Tag>>(`SELECT id FROM tags WHERE name = @name`).get({name: tag});
            const tagId = (tagResult as { id: number }).id;
            tagIds.push(tagId);
        }
    }
    return tagIds;
}