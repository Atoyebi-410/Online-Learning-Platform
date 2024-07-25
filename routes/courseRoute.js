const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { Course, Enrollment } = require('../models');

// Route to render the upload page
router.get('/upload', authMiddleware, checkRole('instructor'), async (req, res) => {
  try {
      const courses = await Course.findAll({ where: { instructorId: req.user.id } });
      res.render('upload', { courses, error: req.flash('error'), success: req.flash('success') });
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
    return res.redirect('/upload');
  }

  const { title, description } = req.body;

  try {
      const course = await Course.create({ title, description, instructorId: req.user.id });
      req.flash('message', 'Course uploaded successfully');
      res.redirect('/upload');
  } catch (error) {
      console.error('Error uploading course:', error);
      req.flash('error', 'Server error');
      return res.redirect('/upload')
  }
});

// Update a course (Instructors only)
router.post('/update/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  const courseId = req.params.id;
  const { title, description } = req.body;
  try {
    await Course.update({ title, description }, { where: { id: courseId } });
    req.flash('success', 'Course updated successfully');
    res.redirect('/upload');
  } catch (error) {
    console.error('Error updating course:', error);
    req.flash('error', 'Failed to update course');
    res.redirect(`/course/edit/${courseId}`);
  }
});


// Delete a course (Instructors only)
router.post('/delete/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  const courseId = req.params.id;
  try {
    await Course.destroy({ where: { id: courseId } });
    req.flash('success', 'Course deleted successfully');
    res.redirect('/upload');
  } catch (error) {
    console.error('Error deleting course:', error);
    req.flash('error', 'Failed to delete course');
    res.redirect('/upload');
  }
});

// router.delete('/courses/delete/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const course = await Course.findByPk(id);
//     if (course.instructorId !== req.user.id) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }
//     await course.destroy();
//     res.status(200).json({ message: 'Course deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete course' });
//   }
// });

// Get all courses (Students)
router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const courses = await Course.findAll();
    const myCourses = await Enrollment.findAll({
      where: { studentId: req.user.id },
      include: Course
    }).map(enrollment => enrollment.Course);
    res.render('courses', { courses, myCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    req.flash('error', 'Failed to load courses.');
    res.redirect('courses');
    // res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Enroll in a course (Students)
router.post('/enroll/:courseId', authMiddleware, checkRole(['student']), async (req, res) => {
  try {
    const {courseId} = req.params;
    const userId = req.user.id; // Assuming the authenticated user ID is available in req.user

    console.log('Enrolling user ID:', userId);
    // Check if the course exists
    const course = await Course.findOne({ where: { id: courseId } });
    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/courses');
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
    await Enrollment.create({ 
      studentId: userId, 
      courseId,
      userId 
    });

    console.log('Enrollment successful');

    req.flash('success', 'You have successfully enrolled in the course.');
    res.redirect('/courses');
  } catch (error) {
    console.error('Error enrolling in course:', error);
    req.flash('error', 'Failed to enroll in course.');
    res.redirect('/courses');
  }
});

module.exports = router;
