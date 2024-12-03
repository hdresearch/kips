import { Command, Option } from 'commander';
import { getDb } from '../lib/index.js';
import fs from 'fs';
import { NoteInsert } from '../types/index.js';

export function createImportCommand() {
    return new Command('import')
    .argument('<file>', 'The file to import')
    .addOption(new Option('-t, --type <type>', 'The type of data to import').choices(['conversation', 'note', 'auth']).makeOptionMandatory(true))
    .action((file, type) => {
        const db = getDb();
        const data = fs.readFileSync(file, 'utf-8');
        if (type?.type === 'note') {
            const insertNote = db.prepare<NoteInsert>(`INSERT INTO notes (content) VALUES (@content)`);
            insertNote.run({content: data});
            console.log(`Imported ${JSON.stringify(type)} and ${file}`);
        }
        db.close();
});
}
