const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/dashboard - summary cards + next appointments
router.get('/', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM doctors) AS total_doctors,
        (SELECT COUNT(*)::int FROM appointments
           WHERE starts_at >= NOW() AND status IN ('pending','confirmed')) AS upcoming_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE starts_at::date = CURRENT_DATE) AS todays_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'pending') AS pending_appointments
    `);
    const upcoming = await pool.query(`
      SELECT a.*, d.name AS doctor_name
      FROM appointments a JOIN doctors d ON d.id = a.doctor_id
      WHERE a.starts_at >= NOW() AND a.status IN ('pending','confirmed')
      ORDER BY a.starts_at ASC LIMIT 5
    `);
    res.json({ success: true, data: { ...stats.rows[0], upcoming: upcoming.rows } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;