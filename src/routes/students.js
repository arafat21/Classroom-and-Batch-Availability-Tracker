const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { student_name, roll_no, batch_id } = req.body;
  if (!student_name) return res.status(400).json({ message: 'student_name is required' });
  try {
    const [result] = await pool.query('INSERT INTO students (student_name, roll_no, batch_id) VALUES (?, ?, ?)', [student_name, roll_no || null, batch_id || null]);
    const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { student_name, roll_no, batch_id } = req.body;
  try {
    await pool.query('UPDATE students SET student_name = ?, roll_no = ?, batch_id = ? WHERE student_id = ?', [student_name, roll_no, batch_id, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
