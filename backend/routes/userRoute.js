const express = require("express");
const { User, Course } = require("../models")

const router = express.Router();

// create a new user
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const newUser = await User.create({ firstName, lastName, email, password })
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
});

// get all the existing users
router.get("/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
})

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

router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.status(200).json(courses);
    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
})

module.exports = router;