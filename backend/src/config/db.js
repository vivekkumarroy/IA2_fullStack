const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    console.log('\n💡  TIP FOR NEW LAPTOPS / EVALUATORS:');
    console.log('   If MongoDB is not installed locally on this machine, run:');
    console.log('   👉  npm run dev:memory');
    console.log('   This automatically starts an embedded in-memory MongoDB engine with pre-seeded data.\n');
    process.exit(1);
  }
};

module.exports = connectDB;

