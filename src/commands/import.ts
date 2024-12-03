import { Command } from 'commander';
import { getDb } from '../lib/index.js';

export function createImportCommand() {
    return new Command('import')
    .argument('<file>', 'The file to import')
    .requiredOption('-t, --type <type>', 'The type of data to import', (arg) => {
        if (!['conversation', 'note', 'auth'].includes(arg)) {
            throw new Error('Invalid type');
        }
    })
    .action((args) => {
        const db = getDb();
        const file = args.file;
        const type = args.type;
});
}
