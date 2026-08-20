const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool configuration supporting local XAMPP and Cloud MySQL (TiDB, Aiven, Railway)
const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      timezone: '+07:00',
      dateStrings: true,
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
      timezone: '+07:00',
      dateStrings: true,
      ssl: (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com'))) ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 30000,
    };

const pool = mysql.createPool(poolConfig);

let schemaInitialized = false;

const ensureSchema = async (connOrPool) => {
  if (schemaInitialized) return;
  let connection = connOrPool;
  let shouldRelease = false;

  try {
    if (!connection || typeof connection.beginTransaction !== 'function') {
      connection = await pool.getConnection();
      shouldRelease = true;
    }

    const alters = [
      'ALTER TABLE transfer_cases ADD COLUMN clinical_symptoms TEXT DEFAULT NULL AFTER reason',
      'ALTER TABLE transfer_cases ADD COLUMN clinical_tests TEXT DEFAULT NULL AFTER clinical_symptoms',
      'ALTER TABLE surgery_cases ADD COLUMN clinical_symptoms TEXT DEFAULT NULL AFTER reason',
      'ALTER TABLE surgery_cases ADD COLUMN clinical_tests TEXT DEFAULT NULL AFTER clinical_symptoms',
      'ALTER TABLE death_cases ADD COLUMN clinical_symptoms TEXT DEFAULT NULL AFTER admission_status',
      'ALTER TABLE death_cases ADD COLUMN clinical_tests TEXT DEFAULT NULL AFTER medical_history',
      'ALTER TABLE critical_cases ADD COLUMN clinical_symptoms TEXT DEFAULT NULL AFTER medical_history',
      'ALTER TABLE critical_cases ADD COLUMN clinical_tests TEXT DEFAULT NULL AFTER clinical_symptoms',
      // Senior DBA Optimization Indexes & Locking Columns
      'ALTER TABLE reports ADD COLUMN is_locked TINYINT(1) DEFAULT 0 AFTER status',
      'ALTER TABLE reports ADD COLUMN locked_at TIMESTAMP NULL DEFAULT NULL AFTER is_locked',
      'ALTER TABLE reports ADD COLUMN locked_by VARCHAR(150) NULL DEFAULT NULL AFTER locked_at',
      'ALTER TABLE reports ADD INDEX idx_is_locked (is_locked)',
      'ALTER TABLE reports ADD UNIQUE INDEX uq_dept_date (department_code, report_date)',
      'ALTER TABLE reports ADD INDEX idx_report_date (report_date)',
      'ALTER TABLE reports ADD INDEX idx_dept_code (department_code)',
      'ALTER TABLE transfer_cases ADD INDEX idx_report_id (report_id)',
      'ALTER TABLE surgery_cases ADD INDEX idx_report_id (report_id)',
      'ALTER TABLE death_cases ADD INDEX idx_report_id (report_id)',
      'ALTER TABLE critical_cases ADD INDEX idx_report_id (report_id)',
      'ALTER TABLE users ADD INDEX idx_dept_code (department_code)',
      // P0 Foreign Keys with ON DELETE CASCADE
      'ALTER TABLE transfer_cases ADD CONSTRAINT fk_transfer_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE',
      'ALTER TABLE surgery_cases ADD CONSTRAINT fk_surgery_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE',
      'ALTER TABLE death_cases ADD CONSTRAINT fk_death_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE',
      'ALTER TABLE critical_cases ADD CONSTRAINT fk_critical_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE'
    ];

    for (const sql of alters) {
      try {
        await connection.query(sql);
      } catch (e) {
        // Ignore duplicate column or index errors
      }
    }

    // Create Audit Logs Table for Medical Compliance
    const createAuditSql = `
      CREATE TABLE IF NOT EXISTS report_audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        department_code VARCHAR(50) NOT NULL,
        report_date DATE NOT NULL,
        action_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
        doctor_name VARCHAR(150) DEFAULT NULL,
        nurse_name VARCHAR(150) DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        changes_summary TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_report_id (report_id),
        INDEX idx_dept_date (department_code, report_date),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await connection.query(createAuditSql);
    } catch (auditErr) {
      console.warn('Audit table check warning:', auditErr.message);
    }

    schemaInitialized = true;
  } catch (err) {
    console.warn('Schema auto-migration check warning:', err.message);
  } finally {
    if (shouldRelease && connection) {
      connection.release();
    }
  }
};

pool.ensureSchema = ensureSchema;

// Warm up the pool and verify connection on startup (only in non-serverless dev mode)
if (!process.env.VERCEL) {
  const connectWithRetry = async () => {
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        const conn = await pool.getConnection();
        await conn.query('SELECT 1');
        await ensureSchema(conn);
        conn.release();
        console.log('✅ MySQL connected & schema verified successfully (attempt', attempt + ')');
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
