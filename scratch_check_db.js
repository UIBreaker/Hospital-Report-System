const pool = require('./server/src/config/db');

async function check() {
  try {
    const [forms] = await pool.execute('SELECT id, code, title, form_type, is_active FROM custom_forms');
    console.log('--- CUSTOM FORMS ---');
    console.table(forms);

    const [subs] = await pool.execute('SELECT id, form_id, submitted_by_user, department_code, submission_date, created_at, submission_data FROM custom_form_submissions ORDER BY id DESC LIMIT 20');
    console.log('--- RECENT SUBMISSIONS ---');
    console.table(subs);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
