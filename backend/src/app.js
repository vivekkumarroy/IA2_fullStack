const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { CORS_ORIGIN } = require('./config/env');
const { requestLogger, morganMiddleware } = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// ── Security & parsing ──
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

// ── Logging ──
app.use(requestLogger);
app.use(morganMiddleware);

// ── API routes ──
app.use('/api', routes);

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

module.exports = app;
