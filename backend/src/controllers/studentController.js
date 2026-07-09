const { pool } = require('../config/db');

// Get all students (with department names)
const getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, d.name AS department_name 
      FROM students s 
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get a single student by ID
const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT s.*, d.name AS department_name 
      FROM students s 
      LEFT JOIN departments d ON s.department_id = d.id 
      WHERE s.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error fetching student ID ${id}:`, err);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
};

// Create a new student
const createStudent = async (req, res) => {
  const { first_name, last_name, email, gpa, enrollment_date, department_id } = req.body;
  
  if (!first_name || !last_name || !email || !enrollment_date) {
    return res.status(400).json({ error: 'first_name, last_name, email, and enrollment_date are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO students (first_name, last_name, email, gpa, enrollment_date, department_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, gpa || 0.0, enrollment_date, department_id || null]
    );
    
    res.status(201).json({
      message: 'Student created successfully',
      studentId: result.insertId
    });
  } catch (err) {
    console.error('Error creating student:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
};

// Update an existing student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, gpa, enrollment_date, department_id } = req.body;

  if (!first_name || !last_name || !email || !enrollment_date) {
    return res.status(400).json({ error: 'first_name, last_name, email, and enrollment_date are required' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE students 
       SET first_name = ?, last_name = ?, email = ?, gpa = ?, enrollment_date = ?, department_id = ? 
       WHERE id = ?`,
      [first_name, last_name, email, gpa || 0.0, enrollment_date, department_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    console.error(`Error updating student ID ${id}:`, err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Another student already has this email' });
    }
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(`Error deleting student ID ${id}:`, err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
