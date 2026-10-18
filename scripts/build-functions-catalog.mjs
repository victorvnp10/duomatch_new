// One maintained source: src/infrastructure/seed. JSON is deploy output only.
import { mkdir, writeFile } from 'node:fs/promises';
import { ACTIVITY_CATALOG, CHALLENGE_CATALOG } from '../src/infrastructure/seed/contentCatalog.js';
const target = new URL('../functions/generated/', import.meta.url);
await mkdir(target, { recursive: true });
const data = JSON.stringify({ activities: ACTIVITY_CATALOG, challenges: CHALLENGE_CATALOG });
await writeFile(new URL('contentCatalog.json', target), `${data}\n`);
console.log(`Functions catalog generated: ${ACTIVITY_CATALOG.length} activities, ${CHALLENGE_CATALOG.length} challenges, ${Buffer.byteLength(data) + 1} bytes`);
