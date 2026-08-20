const pool = require('../config/db');

async function createAuditTable() {
  console.log('🚀 Creating report_audit_logs table in live MySQL database...');
  const conn = await pool.getConnection();

  try {
    const createSql = `
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await conn.query(createSql);
    console.log('✅ TABLE `report_audit_logs` CREATED AND VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error creating audit table:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

createAuditTable();
