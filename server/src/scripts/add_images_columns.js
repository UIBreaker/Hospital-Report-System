const pool = require('../config/db');

async function migrateImages() {
  console.log('Starting migration for images column...');
  const tables = ['transfer_cases', 'surgery_cases', 'death_cases', 'critical_cases'];

  for (const table of tables) {
    try {
      const [cols] = await pool.execute(`SHOW COLUMNS FROM ${table} LIKE 'images'`);
      if (cols.length === 0) {
        console.log(`Adding 'images' LONGTEXT column to table ${table}...`);
        await pool.execute(`ALTER TABLE ${table} ADD COLUMN images LONGTEXT NULL AFTER created_at`);
        console.log(`✓ Added 'images' to ${table}`);
      } else {
        console.log(`Column 'images' already exists in ${table}`);
      }
    } catch (err) {
      console.error(`Error migrating ${table}:`, err);
    }
  }

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrateImages();
