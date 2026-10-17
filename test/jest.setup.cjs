// JSDOM does not supply Encoding APIs. CRA previously provided Node
// compatibility through its runner/polyfill; react-dom/server needs these.
const { TextEncoder, TextDecoder } = require('node:util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
