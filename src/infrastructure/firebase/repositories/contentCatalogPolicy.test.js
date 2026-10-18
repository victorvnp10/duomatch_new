const fs = require('fs');

test('production CSP permits only the regional callable origin without broadening connect-src', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const policy = config.headers.flatMap(rule => rule.headers)
    .find(header => header.key === 'Content-Security-Policy').value;
  const connect = policy.split(';').map(value => value.trim()).find(value => value.startsWith('connect-src ')).split(/\s+/).slice(1);
  expect(connect).toContain('https://southamerica-east1-conexaocasal-18136.cloudfunctions.net');
  expect(connect).not.toContain('*');
  expect(connect).not.toContain('https://*.cloudfunctions.net');
});
