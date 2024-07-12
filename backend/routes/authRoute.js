const express = require("express");
const { User } = require("../models");
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();

// create a new user
router.post("/register", [
    // check for missing fields and password requirements
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').noEmpty().withMessage('invalid email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 length long')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists'})
        }

        const user = await User.create({ firstName, lastName, email, password });
        res.status(201).json(user);
    } catch (error) {
        console.error('error registering user:', error)
        res.status(500).json({ error: "Server error"})
    }
});

router.post("/login", [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // search for email in database
        const user = await User.findOne( {where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials'})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expireIn: '1h'}, (err, token) => {
            if (err) throw err;
            res.json({ token })
        })
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Server error' })
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
});

// Protected route example
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  });

module.exports = router