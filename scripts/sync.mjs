import { copyFileSync, cpSync, existsSync } from 'node:fs';

const SOURCE = 'shared/parser.js';
const TARGETS = ['extension/lib/parser.js', 'visualizer/lib/parser.js'];

if (!existsSync(SOURCE)) {
  console.error(`${SOURCE} does not exist yet — nothing to sync.`);
  process.exit(1);
}

for (const target of TARGETS) {
  copyFileSync(SOURCE, target);
  console.log(`${SOURCE} -> ${target}`);
  cpSync('visualizer', 'extension/visualizer', { recursive: true });
}
