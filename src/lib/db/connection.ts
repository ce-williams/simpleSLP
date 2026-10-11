import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const SOURCE_DB = path.join(process.cwd(), 'data', 'dpop.db');
const VERCEL_DB = '/tmp/dpop.db';

function getDbPath(): string {
  if (process.env.VERCEL) {
    if (!fs.existsSync(VERCEL_DB) && fs.existsSync(SOURCE_DB)) {
      fs.copyFileSync(SOURCE_DB, VERCEL_DB);
    }
    return VERCEL_DB;
  }
  return SOURCE_DB;
}

export function getDb(): InstanceType<typeof Database> {
  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}
