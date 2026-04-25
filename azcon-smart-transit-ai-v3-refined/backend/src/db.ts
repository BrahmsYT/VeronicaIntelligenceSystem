import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(__dirname, '../../database/db.json');
export const readDb = () => JSON.parse(fs.readFileSync(dbPath,'utf-8'));
export const writeDb = (data:any) => fs.writeFileSync(dbPath, JSON.stringify(data,null,2));
