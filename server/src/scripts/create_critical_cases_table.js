const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function createCriticalCasesTable() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  const query = `
    CREATE TABLE IF NOT EXISTS critical_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      patient_name VARCHAR(255),
      age VARCHAR(50),
      address VARCHAR(500),
      admission_time VARCHAR(255),
      medical_history TEXT,
      diagnosis TEXT,
      condition_summary TEXT,
      treatment TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_critical_report_id (report_id),
      CONSTRAINT fk_critical_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.execute(query);
  console.log('critical_cases table created successfully!');

  const [desc] = await pool.execute('DESCRIBE critical_cases');
  console.log('critical_cases schema:', desc);

  await pool.end();
}

createCriticalCasesTable().catch(console.error);
