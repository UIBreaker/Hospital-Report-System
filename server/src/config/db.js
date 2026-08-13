const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool configuration supporting local XAMPP and Cloud MySQL (TiDB, Aiven, Railway)
const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_report',
      charset: 'utf8mb4',
      ssl: (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com'))) ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 30000,
    };

const pool = mysql.createPool(poolConfig);

// Warm up the pool and verify connection on startup (only in non-serverless dev mode)
if (!process.env.VERCEL) {
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
}

module.exports = pool;
