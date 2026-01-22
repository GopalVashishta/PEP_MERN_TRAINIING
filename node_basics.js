// Node.js basics cheat sheet with runnable snippets.
// Run: node node_basics.js
// This file uses CommonJS (default for .js). For ESM, set "type": "module" in package.json or use .mjs.

// --- CommonJS exports/imports (most deployed Node code still uses this) ---
// In another file you would write:
//   module.exports = { add };
//   const utils = require('./utils');
//   const sum = utils.add(2, 3);

// --- ES Modules (ESM) ---
// package.json: { "type": "module" }
// In ESM file: export function add(a, b) { return a + b; }
// In importer: import { add } from './math.js';

const fs = require('fs/promises');
const path = require('path');
const http = require('http');

// Optional dependency: Express is the de-facto web framework in industry.
// Install when ready: npm install express
let express;
try {
  express = require('express');
} catch {
  express = null;
}

// Minimal configuration pattern with env overrides.
const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
};

// Simple structured logger used across sections.
function log(level, msg, meta = {}) {
  const base = { level, msg, time: new Date().toISOString(), env: config.env };
  console.log(JSON.stringify({ ...base, ...meta }));
}

// Small utility to log section headers.
function banner(title) {
  console.log(`\n=== ${title} ===`);
}

async function demoFs() {
  banner('File system (fs/promises)');
  const demoDir = path.join(__dirname, 'tmp-node-basics');
  await fs.mkdir(demoDir, { recursive: true });
  const filePath = path.join(demoDir, 'note.txt');
  await fs.writeFile(filePath, 'Hello from Node.js\n', 'utf8');
  await fs.appendFile(filePath, 'Appending is easy.\n', 'utf8');
  const content = await fs.readFile(filePath, 'utf8');
  console.log('Read content:', content.trim());
  const entries = await fs.readdir(demoDir);
  console.log('Files in demo dir:', entries);
}

function demoHttpServer() {
  banner('Minimal HTTP server');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, path: req.url }));
  });

  server.listen(0, () => {
    const { port } = server.address();
    console.log(`Server listening on http://localhost:${port}`);

    // Fetch once using built-in fetch (available in Node 18+).
    fetch(`http://localhost:${port}/status`)
      .then((resp) => resp.json())
      .then((data) => console.log('HTTP response:', data))
      .finally(() => server.close());
  });
}

function demoAsyncOrder() {
  banner('Event loop ordering');
  console.log('A. sync log');
  setTimeout(() => console.log('C. macrotask (timeout)'), 0);
  Promise.resolve().then(() => console.log('B. microtask (promise)'));
}

function demoEnvAndArgs() {
  banner('Process info');
  console.log('Node version:', process.version);
  console.log('Args:', process.argv.slice(2));
  console.log('ENV example PATH length:', (process.env.PATH || '').length);
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function demoExpressApi() {
  banner('Express-style API (industry standard)');
  if (!express) {
    console.log('Install express to run this demo: npm install express');
    return;
  }

  const app = express();
  app.use(express.json());

  // Request logger middleware.
  app.use((req, _res, next) => {
    log('info', 'request', { method: req.method, path: req.path });
    next();
  });

  app.get('/health', (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  app.post(
    '/echo',
    asyncHandler(async (req, res) => {
      if (typeof req.body.message !== 'string') {
        res.status(400).json({ error: 'message must be a string' });
        return;
      }
      res.json({ echoed: req.body.message.toUpperCase() });
    })
  );

  // Centralized error handler for async routes.
  app.use((err, _req, res, _next) => {
    log('error', 'unhandled', { error: err.message });
    res.status(500).json({ error: 'internal_error' });
  });

  const server = app.listen(0, () => {
    const { port } = server.address();
    console.log(`Express API on http://localhost:${port}`);

    // Smoke test the endpoint then close.
    fetch(`http://localhost:${port}/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello api' }),
    })
      .then((r) => r.json())
      .then((data) => console.log('POST /echo response:', data))
      .finally(() => server.close());
  });
}

async function main() {
  await demoFs();
  demoAsyncOrder();
  demoEnvAndArgs();
  demoHttpServer();
  demoExpressApi();
}

if (require.main === module) {
  // Run demos when executed directly. Remove or comment out sections as needed.
  main().catch((err) => {
    console.error('Unexpected error', err);
    process.exit(1);
  });
}
