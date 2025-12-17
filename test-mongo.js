// test-mongo.js
// jalankan: node test-mongo.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI tidak ditemukan di .env');
    process.exit(1);
  }
  console.log('cobak connect ke monngo:');
  console.log(uri.replace(/(:\/\/[^:]+:)(.+)(@)/, '$1*****$3'));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000, // 20s timeout untuk debugging
    });
    console.log('Connected to MongoDB ✅');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err.message || err);
    console.error(err);
    process.exit(1);
  }
})();