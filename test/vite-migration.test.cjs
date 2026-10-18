const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Vite replaces CRA and Vercel serves the actual output', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.build, 'vite build');
  assert.equal(pkg.dependencies['react-scripts'], undefined);
  assert.equal(JSON.parse(read('vercel.json')).outputDirectory, 'dist');
  assert.match(read('index.html'), /type="module" src="\/src\/index.js"/);
  assert.equal(fs.existsSync(path.join(root, 'public/index.html')), false);
});

test('compatibility env shim preserves Vercel names without exposing host secrets', async () => {
  const { pathToFileURL } = require('node:url');
  const configFactory = (await import(pathToFileURL(path.join(root, 'vite.config.js')).href)).default;
  process.env.REACT_APP_MIGRATION_PROBE = 'public-placeholder';
  process.env.PRIVATE_MIGRATION_PROBE = 'must-not-be-bundled';
  try {
    const config = configFactory({ mode: 'production', command: 'build' });
    const exposed = JSON.parse(config.define['process.env']);
    assert.equal(exposed.REACT_APP_MIGRATION_PROBE, 'public-placeholder');
    assert.equal(exposed.PRIVATE_MIGRATION_PROBE, undefined);
    assert.equal(exposed.PUBLIC_URL, '');
    assert.equal(exposed.NODE_ENV, 'production');
  } finally {
    delete process.env.REACT_APP_MIGRATION_PROBE;
    delete process.env.PRIVATE_MIGRATION_PROBE;
  }
});

test('production HTML references emitted assets and SW precaches the app shell', () => {
  const html = read('dist/index.html');
  assert.match(html, /id="root"/);
  const bundle = html.match(/src="(\/assets\/[^\"]+\.js)"/);
  assert.ok(bundle, 'HTML must load its emitted module bundle');
  assert.ok(fs.existsSync(path.join(root, 'dist', bundle[1])));
  const worker = read('dist/service-worker.js');
  assert.ok(!worker.includes('self.__WB_MANIFEST'), 'precache manifest must be injected');
  assert.match(worker, /index\.html/);
  assert.ok(worker.includes(bundle[1].slice(1)), 'entry bundle must be precached');
  assert.match(worker, /firebase-messaging-compat/);
  assert.match(worker, /SKIP_WAITING/);
  assert.ok(!html.includes('%PUBLIC_URL%'));
});
