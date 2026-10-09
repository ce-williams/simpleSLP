import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DB_PATH = path.join(process.cwd(), 'data', 'dpop.db');

console.log('Resetting DPOP database...');

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Deleted existing database.');
}

const walPath = DB_PATH + '-wal';
const shmPath = DB_PATH + '-shm';
if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

execSync('npx tsx scripts/setup.ts', { stdio: 'inherit', cwd: process.cwd() });
