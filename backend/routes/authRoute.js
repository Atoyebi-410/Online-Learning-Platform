const express = require("express");
const { User } = require("../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const passport = require('../passport');
require('dotenv').config();

const router = express.Router();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
// Send verification email
function sendVerificationEmail(email, token) {
    const url = `http://localhost:3000/api/auth/verify/${token}`;
    transporter.sendMail({
      to: email,
      subject: 'Verify your email',
      html: `Click <a href="${url}">here</a> to verify your email.`,
    }, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }

// create a new user
router.post("/register", [
    // check for missing fields and password requirements
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').notEmpty().withMessage('invalid email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 length long'),
    body('role').isIn(['student', 'instructor']).withMessage('Invalid role')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const { firstName, lastName, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists'})
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword,
            role,
            isVerified: false 
        });
        
        // Generate email verification token
        const verificationToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email (placeholder function, implement actual email sending)
        sendVerificationEmail(user.email, verificationToken);


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
                email: user.email,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h'}, (err, token) => {
            if (err) throw err;
            res.json({ token })
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Server error' })
    }

});

// Email verification
router.get('/verify/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { email: decoded.email } });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // verify the user
      user.isVerified = true;
      await user.save();
  
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Google OAuth login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`/dashboard?token=${token}`);
  }
);

// POST route to logout
router.post('/logout', (req, res) => {
  // Clear any session/token information from client-side storage (e.g., cookies, localStorage)
  res.clearCookie('jwtToken'); // Example for clearing cookie-based token
  res.status(200).json({ message: 'Logout successful' });
});



// Protected route example
// router.get('/protected', authMiddleware, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
//   });

module.exports = router;
