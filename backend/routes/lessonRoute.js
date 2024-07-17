const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/authMiddleware.js');
const Lesson = require('../models');

// Create a lesson (Instructors only)
router.post('/courses/:courseId/lessons', authMiddleware, checkRole(['instructor']), async (req, res) => {
  try {
    const { title, content } = req.body;
    const { courseId } = req.params;
    const lesson = await Lesson.create({ title, content, courseId });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update a lesson (Instructors only)
router.put('/lessons/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const lesson = await Lesson.findByPk(id);
    if (lesson.courseId !== req.user.courseId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await lesson.update({ title, content });
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete a lesson (Instructors only)
router.delete('/lessons/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByPk(id);
    await lesson.destroy();
    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Get lessons in a course (Students)
router.get('/courses/:courseId/lessons', authMiddleware, checkRole(['student']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({ where: { courseId } });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

module.exports = router;
