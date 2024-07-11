const express = require("express");
const { User } = require("../models")

const router = express.Router();

// create a new user
router.get("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // check for missing fields
        if ( !firstName || !lastName || !email || !password) {
            res.status(400).json({error: "All fields are required"})
        }

        // create new user based on the model created
        const newUser = await User.create({ firstName, lastName, email, password })
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

// get all the existing users
router.get("/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
        
    }
})

module.exports = router