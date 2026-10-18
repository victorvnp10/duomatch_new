const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Run after npm run build; guards the actual production artifact, not syntax.
test('seed catalog is lazy, outside the entry and retained in the offline precache', () => {
  const dist = path.join(__dirname, '..', 'dist');
  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const entry = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1].slice(1);
  const sentinel = 'act-hot-1-jogo-dos-5-sentidos';
  assert.equal(readFileSync(path.join(dist, entry), 'utf8').includes(sentinel), false,
    'seed must not be in the initial entry');
  const seed = readdirSync(path.join(dist, 'assets')).filter((file) => file.endsWith('.js'))
    .find((file) => readFileSync(path.join(dist, 'assets', file), 'utf8').includes(sentinel));
  assert.ok(seed, 'seed data must remain available in a separate chunk');
  assert.equal(html.includes(seed), false, 'seed must not be statically preloaded by HTML');
  assert.ok(readFileSync(path.join(dist, entry), 'utf8').includes(seed), 'entry references the dynamic seed chunk');
  assert.ok(readFileSync(path.join(dist, 'service-worker.js'), 'utf8').includes(`assets/${seed}`),
    'PWA must keep the seed chunk available offline');
});
