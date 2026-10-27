import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const databasePath = process.env.SIGRAD_DATABASE ?? join(process.cwd(), 'data', 'sigrad.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });
const sqlite = process.getBuiltinModule?.('node:sqlite');
if (!sqlite) throw new Error('Se requiere Node.js 22.5 o superior.');
const database = new sqlite.DatabaseSync(databasePath);
const users = database.prepare('SELECT id, full_name, document, email, role, created_at FROM users ORDER BY id').all();
console.table(users);
console.log(`Total de usuarios: ${users.length}`);