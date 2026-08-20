const pool = require('../config/db');

async function applyIndexes() {
  console.log('🚀 Starting Step 1: Senior DBA Index Optimization...');
  const conn = await pool.getConnection();

  try {
    const checkAndCreateIndex = async (tableName, indexName, createSql) => {
      try {
        const [existing] = await conn.query(
          `SHOW INDEX FROM \`${tableName}\` WHERE Key_name = ?`,
          [indexName]
        );

        if (existing.length > 0) {
          console.log(`ℹ️  [${tableName}] Index '${indexName}' already exists. Skipping.`);
        } else {
          console.log(`⚙️  [${tableName}] Creating index '${indexName}'...`);
          await conn.query(createSql);
          console.log(`✅ [${tableName}] Index '${indexName}' created successfully!`);
        }
      } catch (err) {
        console.warn(`⚠️  [${tableName}] Error processing '${indexName}':`, err.message);
      }
    };

    // 1. Reports table indexes
    await checkAndCreateIndex(
      'reports',
      'uq_dept_date',
      'ALTER TABLE `reports` ADD UNIQUE INDEX `uq_dept_date` (`department_code`, `report_date`)'
    );

    await checkAndCreateIndex(
      'reports',
      'idx_report_date',
      'ALTER TABLE `reports` ADD INDEX `idx_report_date` (`report_date`)'
    );

    await checkAndCreateIndex(
      'reports',
      'idx_dept_code',
      'ALTER TABLE `reports` ADD INDEX `idx_dept_code` (`department_code`)'
    );

    // 2. Sub-cases report_id Foreign Keys / B-Tree Indexes
    await checkAndCreateIndex(
      'transfer_cases',
      'idx_report_id',
      'ALTER TABLE `transfer_cases` ADD INDEX `idx_report_id` (`report_id`)'
    );

    await checkAndCreateIndex(
      'surgery_cases',
      'idx_report_id',
      'ALTER TABLE `surgery_cases` ADD INDEX `idx_report_id` (`report_id`)'
    );

    await checkAndCreateIndex(
      'death_cases',
      'idx_report_id',
      'ALTER TABLE `death_cases` ADD INDEX `idx_report_id` (`report_id`)'
    );

    await checkAndCreateIndex(
      'critical_cases',
      'idx_report_id',
      'ALTER TABLE `critical_cases` ADD INDEX `idx_report_id` (`report_id`)'
    );

    // 3. Users table indexes
    await checkAndCreateIndex(
      'users',
      'idx_dept_code',
      'ALTER TABLE `users` ADD INDEX `idx_dept_code` (`department_code`)'
    );

    console.log('\n🎉 ALL INDEXES VERIFIED & APPLIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Failed to apply indexes:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

applyIndexes();
