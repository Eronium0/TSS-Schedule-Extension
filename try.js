// Scratch runner — not part of the product, not a test.
// Loads a fixture, hands it to the parser, prints the result.
//
//   node try.js                          -> fixtures/synthetic-quarter.json
//   node try.js quarter-capture.json     -> any other fixture
//
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const file = process.argv[2] ?? 'synthetic-quarter.json';
const raw = JSON.parse(await readFile(`./fixtures/${file}`, 'utf8'));

// v2 responses nest under d.results; v4 responses use value.
const rows = raw.d?.results ?? raw.value ?? [];
console.log(`${file}: ${rows.length} raw rows`);

if (!existsSync('./shared/parser.js')) {
  console.log('\nshared/parser.js does not exist yet — that is today\'s work.');
  process.exit(0);
}

// Imported after the existence check so real syntax errors surface
// instead of being mistaken for "file not found".
const { parseSchedule } = await import('./shared/parser.js');

if (typeof parseSchedule !== 'function') {
  console.log('\nshared/parser.js loaded but does not export parseSchedule yet.');
  process.exit(0);
}

console.log('');
console.dir(parseSchedule(raw), { depth: null });
