const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/doctors - get all doctors (optional ?search=)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let result;
    if (search) {
      result = await pool.query(
        'SELECT * FROM doctors WHERE name ILIKE $1 OR specialization ILIKE $1 ORDER BY name',
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM doctors ORDER BY name');
    }
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/doctors/:id - get one doctor
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/doctors - create a doctor
router.post('/', async (req, res) => {
  const { name, specialization, phone, email, availability, is_active } = req.body;

  // validation
  if (!name || !specialization) {
    return res.status(400).json({ success: false, message: 'Name and specialization are required' });
  }
  if (!phone && !email) {
    return res.status(400).json({ success: false, message: 'Phone or email is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctors (name, specialization, phone, email, availability, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, specialization, phone || null, email || null, availability || 'Mon-Fri 9am-5pm', is_active ?? true]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/doctors/:id - update a doctor
router.put('/:id', async (req, res) => {
  const { name, specialization, phone, email, availability, is_active } = req.body;

  if (!name || !specialization) {
    return res.status(400).json({ success: false, message: 'Name and specialization are required' });
  }
  if (!phone && !email) {
    return res.status(400).json({ success: false, message: 'Phone or email is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE doctors
       SET name = $1, specialization = $2, phone = $3, email = $4, availability = $5, is_active = $6
       WHERE id = $7 RETURNING *`,
      [name, specialization, phone || null, email || null, availability || 'Mon-Fri 9am-5pm', is_active ?? true, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/doctors/:id - delete a doctor (blocked if they have appointments)
router.delete('/:id', async (req, res) => {
  try {
    const check = await pool.query('SELECT COUNT(*)::int AS total FROM appointments WHERE doctor_id = $1', [req.params.id]);
    if (check.rows[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete a doctor who has appointments. Delete those appointments first.',
      });
    }
    const result = await pool.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;