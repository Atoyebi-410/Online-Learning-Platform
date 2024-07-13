const express = require("express");
const { Course } = require("../models") 
const authMiddleware = require("../middleware/authMiddleware")
const router = express.Router();

// create a new course
router.post("/course", async (req, res) => {
    try {
        const { title, description, userId } = req.body;
        const newCourse = await Course.create({ title, description, userId })
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
});

// get all courses
router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.status(200).json(courses);
    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
})

// Protected route example
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  });

module.exports = router;