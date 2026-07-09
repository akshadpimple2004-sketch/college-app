const { pool } = require('../config/db');

// Get high-level statistics & aggregates
const getStats = async (req, res) => {
  try {
    // 1. Total Student Count
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
    
    // 2. Average GPA
    const [[{ avgGPA }]] = await pool.query('SELECT ROUND(AVG(gpa), 2) AS avgGPA FROM students');
    
    // 3. Total Course Count
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
    
    // 4. Headcount per Department
    const [departmentHeadcounts] = await pool.query(`
      SELECT d.name AS department_name, d.code AS department_code, COUNT(s.id) AS student_count
      FROM departments d
      LEFT JOIN students s ON s.department_id = d.id
      GROUP BY d.id
    `);

    res.json({
      summary: {
        totalStudents: totalStudents || 0,
        avgGPA: avgGPA || 0.0,
        totalCourses: totalCourses || 0
      },
      departments: departmentHeadcounts
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get list of departments (for forms dropdown)
const getDepartmentsList = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, code FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching departments list:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

module.exports = {
  getStats,
  getDepartmentsList
};
