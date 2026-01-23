// Express.js industry-style starter/teaching file.
// Run after installing deps: npm install express helmet morgan cors joi express-rate-limit dotenv
// Start: node express_basics.js
// This file favors CommonJS. Switch to ESM by setting "type":"module" in package.json and replacing require with import.

const path = require('path');
const fs = require('fs');

// Optional imports (kept resilient so the file still runs without every package installed).
function safeRequire(name) {
  try { return require(name); } catch { return null; }
}

const express = safeRequire('express');
const helmet = safeRequire('helmet');
const morgan = safeRequire('morgan');
const cors = safeRequire('cors');
const Joi = safeRequire('joi');
const rateLimit = safeRequire('express-rate-limit');
const dotenv = safeRequire('dotenv');

if (!express) {
  console.error('Install express before running: npm install express');
  process.exit(1);
}

// Load .env if present.
if (dotenv && fs.existsSync(path.join(__dirname, '.env'))) {
  dotenv.config();
}

// Central config with env overrides.
const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim()),
};

// Structured logger (stdout; swap with pino/winston in production).
function log(level, msg, meta = {}) {
  const base = { level, msg, time: new Date().toISOString(), env: config.env };
  console.log(JSON.stringify({ ...base, ...meta }));
}

// Async route helper to avoid try/catch noise.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// In-memory store for demo purposes (replace with DB in real apps).
const store = {
  items: [
    { id: '1', name: 'First', done: false },
    { id: '2', name: 'Second', done: true },
  ],
};

// Optional: request validation with Joi. Fallback to minimal manual check.
const itemSchema = Joi
  ? Joi.object({ name: Joi.string().min(1).max(120).required(), done: Joi.boolean().default(false) })
  : null;

function validateItem(body) {
  if (itemSchema) {
    const { error, value } = itemSchema.validate(body);
    if (error) {
      const msg = error.details.map((d) => d.message).join('; ');
      const err = new Error(msg);
      err.status = 400;
      throw err;
    }
    return value;
  }
  // Fallback minimal validation
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }
  return { name: body.name.trim(), done: Boolean(body.done) };
}

// Simple auth stub (replace with real JWT/session middleware).
function authStub(req, _res, next) {
  const token = req.headers['x-demo-token'];
  if (!token) {
    const err = new Error('missing token');
    err.status = 401;
    return next(err);
  }
  req.user = { id: 'user-123', token };
  return next();
}

function buildApp() {
  const app = express();

  // Security headers
  if (helmet) app.use(helmet());

  // CORS (configure origins in env CORS_ORIGINS="https://site.com,https://admin.site.com")
  if (cors) {
    app.use(
      cors({
        origin: config.corsOrigins.includes('*') ? '*' : config.corsOrigins,
        credentials: true,
      })
    );
  }

  // Request logging
  if (morgan) app.use(morgan('combined'));

  // Rate limiting (protects against bursts)
  if (rateLimit) {
    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        limit: 100,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  app.use(express.json({ limit: '1mb' }));

  // Serve static assets from ./public if it exists.
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // Health endpoint (used by load balancers/K8s)
  app.get('/health', (req, res) => {
    res.json({ ok: true, env: config.env, uptime: process.uptime() });
  });

  // Authenticated routes example
  app.get('/me', authStub, (req, res) => {
    res.json({ user: req.user });
  });

  // CRUD routes for items
  app.get('/items', (req, res) => {
    res.json({ data: store.items });
  });

  app.post(
    '/items',
    asyncHandler(async (req, res) => {
      const validated = validateItem(req.body);
      const id = String(Date.now());
      const item = { id, ...validated };
      store.items.push(item);
      res.status(201).json({ item });
    })
  );

  app.put(
    '/items/:id',
    asyncHandler(async (req, res) => {
      const validated = validateItem(req.body);
      const idx = store.items.findIndex((x) => x.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'not_found' });
      store.items[idx] = { ...store.items[idx], ...validated };
      res.json({ item: store.items[idx] });
    })
  );

  app.delete('/items/:id', (req, res) => {
    const before = store.items.length;
    store.items = store.items.filter((x) => x.id !== req.params.id);
    const removed = before !== store.items.length;
    res.json({ removed });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'not_found', path: req.path });
  });

  // Central error handler (catches thrown/called errors)
  app.use((err, req, res, _next) => {
    const status = err.status || 500;
    log('error', 'request_error', { status, path: req.path, message: err.message });
    res.status(status).json({ error: err.message || 'internal_error' });
  });

  return app;
}

function start() {
  const app = buildApp();
  const server = app.listen(config.port, () => {
    log('info', 'server_started', { port: config.port });
  });

  // Graceful shutdown example
  const shutdown = () => {
    log('info', 'shutting_down');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000); // force exit if hung
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  start();
}

module.exports = { buildApp, config };
