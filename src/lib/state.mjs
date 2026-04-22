import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const STATE_DIR = join(process.cwd(), '.foresight-arena');

export function getStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
  return STATE_DIR;
}

export function loadJSON(filename) {
  const path = join(getStateDir(), filename);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch { return null; }
}

export function saveJSON(filename, data) {
  writeFileSync(join(getStateDir(), filename), JSON.stringify(data, null, 2));
}

export function getRevealQueue() {
  return loadJSON('reveal-queue.json') || [];
}

export function saveRevealQueue(queue) {
  saveJSON('reveal-queue.json', queue);
}
