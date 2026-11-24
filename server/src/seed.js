const fs = require('fs');
const path = require('path');
const pool = require('./db');

// tables banane ke liye schema.sql chala dete hain
async function runSchema() {
  const sqlFile = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  await pool.query(sql);
}

async function seed() {
  await runSchema();

  // pehle check karo k data pehle se to nahi para hua
  const result = await pool.query('SELECT COUNT(*)::int AS n FROM doctors');
  if (result.rows[0].n > 0) {
    console.log('Already seeded, skipping.');
    return;
  }

  // doctors ka data
  await pool.query(`
    INSERT INTO doctors (name, specialization, phone, email, availability, is_active) VALUES
    ('Dr. Ayesha Khan', 'Orthodontist', '0300-1111111', 'ayesha@clinic.com', 'Mon-Fri 9am-3pm', TRUE),
    ('Dr. Ali Raza', 'Endodontist', '0301-2222222', 'ali@clinic.com', 'Tue-Sat 11am-7pm', TRUE),
    ('Dr. Sara Ahmed', 'Pediatric Dentist', '0302-3333333', 'sara@clinic.com', 'Mon-Wed 10am-4pm', TRUE),
    ('Dr. Bilal Hussain', 'Oral Surgeon', '0303-4444444', 'bilal@clinic.com', 'Thu-Sat 9am-2pm', FALSE)
  `);

  // appointments (aaj, kal, parso, aur purani wali bhi)
  await pool.query(`
    INSERT INTO appointments (patient_name, patient_phone, patient_email, doctor_id, starts_at, duration_minutes, reason, status) VALUES
    ('Hamza Tariq', '0311-5550001', 'hamza@mail.com', 1, date_trunc('day', NOW()) + interval '10 hours', 30, 'Braces adjustment', 'confirmed'),
    ('Fatima Noor', '0311-5550002', NULL, 2, date_trunc('day', NOW()) + interval '14 hours', 60, 'Root canal', 'pending'),
    ('Usman Shah', '0311-5550003', 'usman@mail.com', 3, date_trunc('day', NOW()) + interval '1 day 11 hours', 30, 'Child checkup', 'pending'),
    ('Zainab Malik', '0311-5550004', NULL, 1, date_trunc('day', NOW()) + interval '2 days 9 hours', 45, 'Consultation', 'confirmed'),
    ('Ahmed Ali', '0311-5550005', NULL, 2, date_trunc('day', NOW()) - interval '1 day' + interval '12 hours', 30, 'Cleaning', 'completed'),
    ('Maryam Siddiqui', '0311-5550006', 'maryam@mail.com', 3, date_trunc('day', NOW()) + interval '3 days 10 hours', 30, 'Cavity filling', 'cancelled')
  `);

  console.log('Seeded successfully.');
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());