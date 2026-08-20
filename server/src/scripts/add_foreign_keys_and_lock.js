const pool = require('../config/db');

async function runMigration() {
  console.log('🚀 Starting Database Migration: P0 Foreign Keys & P1 Locking Mechanism...');
  const conn = await pool.getConnection();

  try {
    // 1. Add locking columns to reports table
    console.log('📋 Checking and adding locking columns to `reports` table...');
    const columnsToAdd = [
      "ALTER TABLE reports ADD COLUMN is_locked TINYINT(1) DEFAULT 0 AFTER status",
      "ALTER TABLE reports ADD COLUMN locked_at TIMESTAMP NULL DEFAULT NULL AFTER is_locked",
      "ALTER TABLE reports ADD COLUMN locked_by VARCHAR(150) NULL DEFAULT NULL AFTER locked_at",
      "ALTER TABLE reports ADD INDEX idx_is_locked (is_locked)"
    ];

    for (const sql of columnsToAdd) {
      try {
        await conn.query(sql);
        console.log('  ✅ Executed:', sql);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME' || err.errno === 1060 || err.errno === 1061) {
          console.log('  ℹ️  Column/Index already exists (skipped):', sql);
        } else {
          console.warn('  ⚠️  Warning executing:', sql, '-', err.message);
        }
      }
    }

    // 2. Clean up any orphaned records before adding foreign keys
    console.log('🧹 Checking and cleaning orphaned sub-records...');
    const tables = ['transfer_cases', 'surgery_cases', 'death_cases', 'critical_cases'];
    for (const t of tables) {
      const [res] = await conn.query(`DELETE FROM ${t} WHERE report_id NOT IN (SELECT id FROM reports)`);
      if (res.affectedRows > 0) {
        console.log(`  🗑️  Cleaned ${res.affectedRows} orphaned records from ${t}`);
      }
    }

    // 3. Add Foreign Key Constraints with ON DELETE CASCADE
    console.log('🔗 Adding Foreign Key Constraints with ON DELETE CASCADE...');
    const fkConfigs = [
      {
        table: 'transfer_cases',
        name: 'fk_transfer_cases_report',
        sql: 'ALTER TABLE transfer_cases ADD CONSTRAINT fk_transfer_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE'
      },
      {
        table: 'surgery_cases',
        name: 'fk_surgery_cases_report',
        sql: 'ALTER TABLE surgery_cases ADD CONSTRAINT fk_surgery_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE'
      },
      {
        table: 'death_cases',
        name: 'fk_death_cases_report',
        sql: 'ALTER TABLE death_cases ADD CONSTRAINT fk_death_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE'
      },
      {
        table: 'critical_cases',
        name: 'fk_critical_cases_report',
        sql: 'ALTER TABLE critical_cases ADD CONSTRAINT fk_critical_cases_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE'
      }
    ];

    for (const fk of fkConfigs) {
      try {
        await conn.query(fk.sql);
        console.log(`  ✅ Added Foreign Key Constraint: ${fk.name} on ${fk.table}`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEY' || err.errno === 1826 || err.message.includes('already exists') || err.message.includes('Duplicate foreign key')) {
          console.log(`  ℹ️  Foreign Key ${fk.name} on ${fk.table} already exists`);
        } else {
          console.warn(`  ⚠️  Warning adding FK on ${fk.table}:`, err.message);
        }
      }
    }

    // 4. Verify tables
    console.log('🔍 Verifying final foreign keys and columns in database...');
    const [fks] = await conn.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'reports'
    `);
    console.log('  📋 Active Foreign Keys referencing reports:');
    fks.forEach(f => {
      console.log(`    - ${f.TABLE_NAME}.${f.COLUMN_NAME} -> ${f.REFERENCED_TABLE_NAME}.${f.REFERENCED_COLUMN_NAME} (${f.CONSTRAINT_NAME})`);
    });

    console.log('🎉 Database Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

runMigration();
