const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { Course, User, Enrollment } = require('../models');

// Route to render the upload page
router.get('/upload', authMiddleware, checkRole('instructor'), async (req, res) => {
  try {
      const courses = await Course.findAll({ where: { instructorId: req.user.id } });
      res.render('../../frontend/views/upload.ejs', { courses, error: req.flash('error'), success: req.flash('success') });
  } catch (error) {
      console.error('Error fetching courses:', error);
      req.flash('error', 'Server error');
      res.redirect('/');
  }
});

// Handle course upload
router.post('/upload', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
], authMiddleware, checkRole('instructor'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('/api/course/upload');
  }

  const { title, description } = req.body;

  try {
      const course = await Course.create({ title, description, instructorId: req.user.id });
      req.flash('message', 'Course uploaded successfully');
      res.redirect('/api/course/upload');
  } catch (error) {
      console.error('Error uploading course:', error);
      req.flash('error', 'Server error');
      return res.redirect('/api/course/upload')
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
router.post('/enroll/:courseId', authMiddleware, checkRole(['student']), async (req, res) => {
  try {
    const {courseId} = req.params;
    const userId = req.user.id; // Assuming the authenticated user ID is available in req.user

    // Check if the course exists
    const course = await Course.findOne({ where: { id: courseId } });
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { studentId: userId, courseId },
    });
    if (existingEnrollment) {
      req.flash('error', 'You are already enrolled in this course.');
      return res.redirect('/courses');
    }

    // Enroll the student in the course
    await Enrollment.create({ studentId: userId, courseId });

    req.flash('success', 'You have successfully enrolled in the course.');
    res.redirect('/courses');
  } catch (error) {
    console.error('Error enrolling in course:', error);
    req.flash('error', 'Failed to enroll in course.');
    res.redirect('/courses');
  }
});

module.exports = router;
