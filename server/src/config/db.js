const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool with aggressive keepalive to survive MySQL restarts
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_report',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Keep-alive: ping every 30s to prevent idle connection drops
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Reconnect if lost
  connectTimeout: 30000,
});

// Warm up the pool and verify connection on startup, with infinite retry
const connectWithRetry = async () => {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const conn = await pool.getConnection();
      await conn.query('SELECT 1');
      conn.release();
      console.log('✅ MySQL connected successfully (attempt', attempt + ')');
      return;
    } catch (err) {
      console.error(`⚠️  MySQL not ready (attempt ${attempt}): ${err.message} — retrying in 3s...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};


connectWithRetry();

module.exports = pool;
