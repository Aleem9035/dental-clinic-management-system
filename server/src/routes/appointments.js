const express = require('express');
const pool = require('../db');
const router = express.Router();

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// same SELECT used everywhere: appointment + doctor name
const BASE_SELECT = `
  SELECT a.*, d.name AS doctor_name, d.specialization AS doctor_specialization
  FROM appointments a
  JOIN doctors d ON d.id = a.doctor_id`;

// check the form data, returns an object of errors (empty = valid)
function checkAppointment(body) {
  const errors = {};
  if (!body.patient_name || !body.patient_name.trim()) errors.patient_name = 'Patient name is required';
  if (!body.patient_phone || !body.patient_phone.trim()) errors.patient_phone = 'Patient phone is required';
  if (!body.reason || !body.reason.trim()) errors.reason = 'Reason is required';
  if (!body.doctor_id) errors.doctor_id = 'Doctor is required';
  if (!body.starts_at || isNaN(new Date(body.starts_at))) errors.starts_at = 'A valid date and time is required';
  if (body.status && !STATUSES.includes(body.status)) errors.status = 'Invalid status';
  const duration = Number(body.duration_minutes || 30);
  if (!Number.isInteger(duration) || duration <= 0) errors.duration_minutes = 'Duration must be a positive number';
  return errors;
}

// returns true if this doctor already has an appointment in that time
async function hasOverlap(doctorId, startsAt, duration, ignoreId) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + duration * 60000);
  const result = await pool.query(
    `SELECT id FROM appointments
     WHERE doctor_id = $1
       AND status <> 'cancelled'
       AND id <> $4
       AND starts_at < $3
       AND starts_at + (duration_minutes * interval '1 minute') > $2
     LIMIT 1`,
    [doctorId, start.toISOString(), end.toISOString(), ignoreId]
  );
  return result.rows.length > 0;
}

// GET /api/appointments?status=&doctorId=&date=&search=
router.get('/', async (req, res) => {
  try {
    const { status, doctorId, date, search } = req.query;
    const conditions = [];
    const values = [];

    if (status) { values.push(status); conditions.push(`a.status = $${values.length}`); }
    if (doctorId) { values.push(Number(doctorId)); conditions.push(`a.doctor_id = $${values.length}`); }
    if (date) { values.push(date); conditions.push(`a.starts_at::date = $${values.length}::date`); }
    if (search) { values.push(`%${search}%`); conditions.push(`a.patient_name ILIKE $${values.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(`${BASE_SELECT} ${where} ORDER BY a.starts_at DESC`, values);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`${BASE_SELECT} WHERE a.id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  const errors = checkAppointment(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const { patient_name, patient_phone, patient_email, doctor_id, starts_at, reason } = req.body;
  const duration = Number(req.body.duration_minutes || 30);
  const status = req.body.status || 'pending';

  try {
    // doctor must exist
    const doctor = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctor_id]);
    if (doctor.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: { doctor_id: 'Selected doctor does not exist' } });
    }

    // no overlapping time for the same doctor
    if (status !== 'cancelled' && await hasOverlap(doctor_id, starts_at, duration, 0)) {
      return res.status(409).json({ success: false, message: 'This doctor already has an appointment at that time' });
    }

    const inserted = await pool.query(
      `INSERT INTO appointments (patient_name, patient_phone, patient_email, doctor_id, starts_at, duration_minutes, reason, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [patient_name.trim(), patient_phone.trim(), patient_email || null, doctor_id, new Date(starts_at).toISOString(), duration, reason.trim(), status]
    );
    const full = await pool.query(`${BASE_SELECT} WHERE a.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ success: true, data: full.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  const errors = checkAppointment(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const id = Number(req.params.id);
  const { patient_name, patient_phone, patient_email, doctor_id, starts_at, reason } = req.body;
  const duration = Number(req.body.duration_minutes || 30);
  const status = req.body.status || 'pending';

  try {
    const exists = await pool.query('SELECT id FROM appointments WHERE id = $1', [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctor = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctor_id]);
    if (doctor.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: { doctor_id: 'Selected doctor does not exist' } });
    }

    // ignore this same appointment while checking overlap
    if (status !== 'cancelled' && await hasOverlap(doctor_id, starts_at, duration, id)) {
      return res.status(409).json({ success: false, message: 'This doctor already has an appointment at that time' });
    }

    await pool.query(
      `UPDATE appointments
       SET patient_name=$1, patient_phone=$2, patient_email=$3, doctor_id=$4,
           starts_at=$5, duration_minutes=$6, reason=$7, status=$8
       WHERE id=$9`,
      [patient_name.trim(), patient_phone.trim(), patient_email || null, doctor_id, new Date(starts_at).toISOString(), duration, reason.trim(), status, id]
    );
    const full = await pool.query(`${BASE_SELECT} WHERE a.id = $1`, [id]);
    res.json({ success: true, data: full.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;