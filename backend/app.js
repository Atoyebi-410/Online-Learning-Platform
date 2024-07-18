const express = require('express');
const authRoutes = require('./routes/authRoute.js');
const sequelize = require("./config/database.js");
const passport = require('./passport.js');
const session = require('express-session');
const courseRoutes = require('./routes/courseRoute');
const lessonRoutes = require('./routes/lessonRoute');
const bodyParser = require('body-parser');
const Course = require('./models/course.js');
const path = require('path')
const flash = require('connect-flash');
require('dotenv').config();

const app = express();

// set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware tp parse json
app.use(express.json());

app.use(flash());

// Middleware to make static files readable
app.use(express.static('../frontend/public'));

// Initialize session
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use routes
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);

// app.use((req, res, next) => {
//   res.locals.success = req.flash('success');
//   res.locals.error = req.flash('error');
//   next();
// });


app.get('/', async (req, res) => {
  try {
      const courses = await Course.findAll();
      res.render('../../frontend/views/index.ejs', { courses });
  } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


app.get('/register', (req, res) => {
  res.render('../../frontend/views/register.ejs', { messages: req.flash() || {} });
});

// render login page
app.get('/login', (req, res) => {
  res.render('../../frontend/views/login.ejs', { messages: req.flash() || {} });
});

// render upload page
app.get('/upload', (req, res) => {
  res.render('../../frontend/views/upload.ejs', { message: req.flash('message') });
});

app.get('/courses', async (req, res) => {
  try {
      const courses = await Course.findAll();
      res.render('../../frontend/views/courses', { courses, loggedIn: req.isAuthenticated() });
  } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/logout', (req, res) => {
  // Clear any session/token information from client-side storage (e.g., cookies, localStorage)
  res.clearCookie('jwtToken'); // Example for clearing cookie-based token
  res.status(200).render('../../frontend/views/index.ejs', { message: 'Logout successful' });
});

// Synchronize the database
sequelize.sync({ force: true })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(error => {
    console.error('Error synchronizing database:', error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })