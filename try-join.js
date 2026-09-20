import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parse } from 'node:path';

const file = process.argv[2] ?? 'quarter-capture.json';
const file2 = process.argv[3] ?? 'sections-capture.json';
const raw = JSON.parse(await readFile(`./fixtures/${file}`, 'utf8'));
const raw2 = JSON.parse(await readFile(`./fixtures/${file2}`, 'utf8'));

const rows = raw.d?.results ?? raw.value ?? [];
console.log(`${file}: ${rows.length} raw rows`);

const rows2 = raw2.value ?? raw2.value ?? [];
console.log(`${file2}: ${rows2.length} raw rows`);

if (!existsSync('./shared/parser.js')) {
  console.log('\nshared/parser.js does not exist yet — that is today\'s work.');
  process.exit(0);
}

const { parseSchedule } = await import('./shared/parser.js');
const { enrichSections } = await import('./shared/parser.js');

console.log('');
const parsed = parseSchedule(raw);
console.dir(parsed, { depth: null });
console.dir(enrichSections(parsed, raw2), { depth: null });