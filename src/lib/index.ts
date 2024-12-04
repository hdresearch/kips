import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { Tag, TagInsert } from '../types/index.js';
import { join } from 'path';
import os from 'os';

export function getDb(init = false) {
    const dbPath = join(os.homedir(), '.config', 'kips');
    const db = new Database(join(dbPath, 'kips.db'), { fileMustExist: !init });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
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