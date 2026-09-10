// Build plumbing, not app logic.
// Copies shared/parser.js into the extension and visualizer, which each need their
// own copy because the extension cannot reference files outside its own folder.
// Run with: npm run sync
import { copyFileSync, existsSync } from 'node:fs';

const SOURCE = 'shared/parser.js';
const TARGETS = ['extension/lib/parser.js', 'visualizer/lib/parser.js'];

if (!existsSync(SOURCE)) {
  console.error(`${SOURCE} does not exist yet — nothing to sync.`);
  process.exit(1);
}

for (const target of TARGETS) {
  copyFileSync(SOURCE, target);
  console.log(`${SOURCE} -> ${target}`);
}
