const { pool } = require('../config/db');

// Get all courses (with department names)
const getAllCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, d.name AS department_name 
      FROM courses c 
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  const { name, code, credits, department_id } = req.body;

  if (!name || !code || !credits) {
    return res.status(400).json({ error: 'name, code, and credits are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO courses (name, code, credits, department_id) VALUES (?, ?, ?, ?)',
      [name, code, credits, department_id || null]
    );

    res.status(201).json({
      message: 'Course created successfully',
      courseId: result.insertId
    });
  } catch (err) {
    console.error('Error creating course:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Course code already exists' });
    }
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error(`Error deleting course ID ${id}:`, err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  deleteCourse
};
