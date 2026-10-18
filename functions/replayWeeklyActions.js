#!/usr/bin/env node
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { reconcileWeeklyActions } = require('./reconcileWeeklyActions');
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('node functions/replayWeeklyActions.js --project PROJECT [--couple ID] [--apply]\nDefault: read-only dry-run. --apply writes weekly state/markers, NEVER origins or rounds. Uses ADC.');
    return;
  }
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--project', '--couple', '--apply'].includes(key) || Object.hasOwn(options, key)) {
      throw new Error('Unknown or repeated argument; use --help');
    }
    if (key === '--apply') options[key] = true;
    else {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
      options[key] = value;
    }
  }
  const projectId = options['--project'];
  const coupleId = options['--couple'];
  if (!projectId || (coupleId !== undefined && !/^[a-zA-Z0-9_-]{1,200}$/.test(coupleId))) throw new Error('Explicit valid --project required; invalid project/couple');
  const db = getFirestore(initializeApp({ projectId }));
  try { await reconcileWeeklyActions(db, { dryRun: !args.includes('--apply'), coupleId }); }
  finally { await db.terminate(); }
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { main };
