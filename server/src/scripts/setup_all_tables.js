const pool = require('../config/db');

async function setupTables() {
  console.log('--- STARTING DATABASE INITIALIZATION ---');

  // 1. surgery_cases
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS surgery_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      patient_name VARCHAR(255) NULL,
      birth_year VARCHAR(50) NULL,
      admission_time VARCHAR(100) NULL,
      surgery_time VARCHAR(100) NULL,
      main_surgeon VARCHAR(255) NULL,
      anesthesiologist VARCHAR(255) NULL,
      pre_diagnosis TEXT NULL,
      post_diagnosis TEXT NULL,
      surgery_method TEXT NULL,
      anesthesia_method VARCHAR(255) NULL,
      post_op_status TEXT NULL,
      notes TEXT NULL,
      images LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (report_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Verified table: surgery_cases');

  // 2. death_cases
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS death_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      patient_name VARCHAR(255) NULL,
      age VARCHAR(50) NULL,
      gender VARCHAR(20) NULL,
      address VARCHAR(255) NULL,
      admission_time VARCHAR(100) NULL,
      death_time VARCHAR(100) NULL,
      death_location VARCHAR(255) NULL,
      diagnosis TEXT NULL,
      treatment_summary LONGTEXT NULL,
      cause_of_death TEXT NULL,
      notes TEXT NULL,
      images LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (report_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Verified table: death_cases');

  // 3. critical_cases
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS critical_cases (
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
  console.log('✓ Verified table: critical_cases');

  // 4. Check images column in transfer_cases
  const [cols] = await pool.execute("SHOW COLUMNS FROM transfer_cases LIKE 'images'");
  if (cols.length === 0) {
    await pool.execute("ALTER TABLE transfer_cases ADD COLUMN images LONGTEXT NULL");
    console.log('✓ Added images column to transfer_cases');
  } else {
    console.log('✓ Verified column images in transfer_cases');
  }

  // 5. staff_members
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS staff_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      position VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      certificate VARCHAR(100) NULL,
      gender ENUM('Nam', 'Nữ') DEFAULT 'Nam',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (department),
      INDEX (position)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✓ Verified table: staff_members');

  const [tables] = await pool.execute('SHOW TABLES');
  console.log('CURRENT DATABASE TABLES:', tables.map(t => Object.values(t)[0]));
  console.log('--- ALL TABLES INITIALIZED SUCCESSFULLY ---');
  process.exit(0);
}

setupTables().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
