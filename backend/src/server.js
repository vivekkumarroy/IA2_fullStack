const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const app = require('./app');

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀  ShelfLife API running on http://localhost:${PORT}`);
    console.log(`📚  Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
