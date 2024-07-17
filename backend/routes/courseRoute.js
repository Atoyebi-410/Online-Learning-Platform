const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const Course = require('../models/course');

// Create a course (Instructors only)
router.post('/courses', authMiddleware, checkRole(['instructor']), async (req, res) => {
  try {
    const { title, description } = req.body;
    const instructorId = req.user.id;
    const course = await Course.create({ title, description, instructorId });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update a course (Instructors only)
router.put('/courses/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const course = await Course.findByPk(id);
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await course.update({ title, description });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete a course (Instructors only)
router.delete('/courses/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await course.destroy();
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Get all courses (Students)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Enroll in a course (Students)
router.post('/courses/:id/enroll', authMiddleware, checkRole(['student']), async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; // Assuming the authenticated user ID is available in req.user

    // Find the course by ID
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { studentId: userId, courseId },
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Enroll the student in the course
    await Enrollment.create({ studentId: userId, courseId });

    res.status(200).json({ message: 'Enrolled in course successfully' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
