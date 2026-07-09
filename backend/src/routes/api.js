const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const courseController = require('../controllers/courseController');
const departmentController = require('../controllers/departmentController');

// Student Routes
router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentController.createStudent);
router.put('/students/:id', studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);

// Course Routes
router.get('/courses', courseController.getAllCourses);
router.post('/courses', courseController.createCourse);
router.delete('/courses/:id', courseController.deleteCourse);

// Department & Statistics Routes
router.get('/stats', departmentController.getStats);
router.get('/departments', departmentController.getDepartmentsList);

module.exports = router;
