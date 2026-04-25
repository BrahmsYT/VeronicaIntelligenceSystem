import fs from 'fs';
import path from 'path';

const resolvedPath = path.resolve(__dirname, '../../database/db.json');

if (!fs.existsSync(resolvedPath)) {
	throw new Error(`Database file not found at ${resolvedPath}. Expected canonical path: database/db.json`);
}

export const readDb = () => JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
export const writeDb = (data: any) => fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2));
export const dbFilePath = resolvedPath;
