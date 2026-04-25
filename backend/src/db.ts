import fs from 'fs';
import path from 'path';

const primaryDbPath = path.resolve(__dirname, '../../database/db.json');
const legacyDbPath = path.resolve(__dirname, '../../database/database/db.json');
const resolvedPath = fs.existsSync(primaryDbPath) ? primaryDbPath : legacyDbPath;

export const readDb = () => JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
export const writeDb = (data: any) => fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2));
export const dbFilePath = resolvedPath;
