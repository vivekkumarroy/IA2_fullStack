const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Local demo runner used by `npm run dev:memory`.
 * It starts an ephemeral MongoDB instance, seeds the assignment data, and then
 * serves the regular Express application. No local MongoDB installation is needed.
 */
const start = async () => {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri('shelflife');
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'shelflife-memory-dev-secret';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
  process.env.LOAN_PERIOD_DAYS = process.env.LOAN_PERIOD_DAYS || '14';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
  process.env.NODE_ENV = 'development';

  const { seed } = require('./scripts/seed');
  const app = require('./app');
  const mongoose = require('mongoose');
  const port = Number(process.env.PORT) || 5000;

  await seed({ disconnect: false });

  const cleanup = async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  };

  const server = app.listen(port);

  server.once('listening', () => {
    console.log(`🚀  ShelfLife in-memory API running on http://localhost:${port}`);
    console.log('📚  Demo data is ready. Press Ctrl+C to stop.');
  });

  server.once('error', async (error) => {
    console.error(`❌  Unable to listen on port ${port}: ${error.message}`);
    await cleanup();
    process.exitCode = 1;
  });

  const shutdown = async () => {
    console.log('\nShutting down ShelfLife in-memory server…');
    server.close(async () => {
      await cleanup();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

start().catch((error) => {
  console.error('❌  Unable to start the in-memory demo server:', error);
  process.exitCode = 1;
});
