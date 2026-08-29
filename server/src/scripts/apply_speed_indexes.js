const pool = require('../config/db');

async function applySpeedIndexes() {
  console.log('--- STARTING HIGH-SPEED INDEXING OPTIMIZATION ---');

  const indexes = [
    {
      table: 'reports',
      name: 'idx_reports_date_dept',
      sql: 'ALTER TABLE reports ADD INDEX idx_reports_date_dept (report_date, department_code)'
    },
    {
      table: 'reports',
      name: 'idx_reports_date_status',
      sql: 'ALTER TABLE reports ADD INDEX idx_reports_date_status (report_date, status)'
    },
    {
      table: 'reports',
      name: 'idx_reports_date_locked',
      sql: 'ALTER TABLE reports ADD INDEX idx_reports_date_locked (report_date, is_locked)'
    },
    {
      table: 'transfer_cases',
      name: 'idx_transfer_report_id',
      sql: 'ALTER TABLE transfer_cases ADD INDEX idx_transfer_report_id (report_id)'
    },
    {
      table: 'surgery_cases',
      name: 'idx_surgery_report_id',
      sql: 'ALTER TABLE surgery_cases ADD INDEX idx_surgery_report_id (report_id)'
    },
    {
      table: 'death_cases',
      name: 'idx_death_report_id',
      sql: 'ALTER TABLE death_cases ADD INDEX idx_death_report_id (report_id)'
    },
    {
      table: 'critical_cases',
      name: 'idx_critical_report_id',
      sql: 'ALTER TABLE critical_cases ADD INDEX idx_critical_report_id (report_id)'
    },
    {
      table: 'staff_members',
      name: 'idx_staff_dept_active',
      sql: 'ALTER TABLE staff_members ADD INDEX idx_staff_dept_active (department, is_active)'
    },
    {
      table: 'system_changelogs',
      name: 'idx_changelogs_id_desc',
      sql: 'ALTER TABLE system_changelogs ADD INDEX idx_changelogs_id_desc (id DESC)'
    }
  ];

  for (const idx of indexes) {
    try {
      // Check if index already exists
      const [existing] = await pool.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [idx.table, idx.name]
      );

      if (existing.length === 0) {
        await pool.query(idx.sql);
        console.log(`✓ Created index [${idx.name}] on table [${idx.table}]`);
      } else {
        console.log(`- Index [${idx.name}] already exists on table [${idx.table}]`);
      }
    } catch (err) {
      console.warn(`! Warning on index ${idx.name}:`, err.message);
    }
  }

  console.log('--- HIGH-SPEED INDEXING COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

applySpeedIndexes().catch(err => {
  console.error('Fatal indexing error:', err);
  process.exit(1);
});
