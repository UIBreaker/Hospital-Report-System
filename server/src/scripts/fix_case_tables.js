const pool = require('../config/db');

async function fixTableSchemas() {
  console.log('Fixing and aligning all table schemas...');

  // 1. Drop and recreate surgery_cases with exact columns
  await pool.execute('DROP TABLE IF EXISTS surgery_cases');
  await pool.execute(`
    CREATE TABLE surgery_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      patient_name VARCHAR(255) NULL,
      birth_year VARCHAR(50) NULL,
      address VARCHAR(255) NULL,
      admission_time VARCHAR(100) NULL,
      reason VARCHAR(255) NULL,
      preoperative_diagnosis TEXT NULL,
      consultation_order TEXT NULL,
      postoperative_diagnosis TEXT NULL,
      current_status TEXT NULL,
      images LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (report_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Recreated surgery_cases with correct schema');

  // 2. Drop and recreate death_cases with exact columns
  await pool.execute('DROP TABLE IF EXISTS death_cases');
  await pool.execute(`
    CREATE TABLE death_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      patient_name VARCHAR(255) NULL,
      age VARCHAR(50) NULL,
      address VARCHAR(255) NULL,
      admission_time VARCHAR(100) NULL,
      reason VARCHAR(255) NULL,
      admission_status TEXT NULL,
      medical_history TEXT NULL,
      clinical_tests TEXT NULL,
      diagnosis TEXT NULL,
      emergency_treatment LONGTEXT NULL,
      final_outcome TEXT NULL,
      images LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (report_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Recreated death_cases with correct schema');

  // 3. Drop and recreate critical_cases with exact columns
  await pool.execute('DROP TABLE IF EXISTS critical_cases');
  await pool.execute(`
    CREATE TABLE critical_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      patient_name VARCHAR(255) NULL,
      age VARCHAR(50) NULL,
      address VARCHAR(255) NULL,
      admission_time VARCHAR(100) NULL,
      medical_history TEXT NULL,
      diagnosis TEXT NULL,
      condition_summary LONGTEXT NULL,
      treatment TEXT NULL,
      notes TEXT NULL,
      images LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (report_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Recreated critical_cases with correct schema');

  console.log('--- ALL CASE TABLES ALIGNED PERFECTLY ---');
  process.exit(0);
}

fixTableSchemas().catch(err => {
  console.error('Error fixing schemas:', err);
  process.exit(1);
});
