const express = require('express');
const authRoutes = require('./routes/authRoute.js');
const sequelize = require("./config/database.js");
const passport = require('./passport.js');
const session = require('express-session');
const courseRoutes = require('./routes/courseRoute');
const lessonRoutes = require('./routes/lessonRoute');
const bodyParser = require('body-parser');
const Course = require('./models/course.js');
const cookieParser = require('cookie-parser');
const path = require('path')
const flash = require('connect-flash');
const { Enrollment} = require('./models')
const {authMiddleware, checkRole} = require('./middleware/authMiddleware.js');
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
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use routes
app.use('/api/auth', authRoutes)
app.use('/api/course', courseRoutes);
app.use('/api/lesson', lessonRoutes);
app.use((req, res, next) => {
  res.isAuthenticated = req.user ? true : false;
  next();
});


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

// // render upload page
// app.get('/upload', (req, res) => {
//   res.render('../../frontend/views/upload.ejs', { message: req.flash('message') });
// });

// Route to render the upload page
app.get('/upload', authMiddleware, checkRole('instructor'), async (req, res) => {
  try {
      const courses = await Course.findAll({ where: { instructorId: req.user.id } });
      res.render('../../frontend/views/upload.ejs', { courses, error: req.flash('error'), success: req.flash('success') });
  } catch (error) {
      console.error('Error fetching courses:', error);
      req.flash('error', 'Server error');
      res.redirect('/');
  }
});

// route to render edit course page
app.get('/course/edit/:id', authMiddleware, checkRole(['instructor']), async (req, res) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/upload.ejs');
    }
    res.render('editCourse.ejs', { course });
  } catch (error) {
    console.error('Error fetching course:', error);
    req.flash('error', 'Server error');
    res.redirect('/upload.ejs');
  }
});

// render upload page
// app.get('/courses', (req, res) => {
//   res.render('../../frontend/views/courses.ejs', { message: req.flash('message') });
// });

app.get('/courses', authMiddleware, async (req, res) => {
  try {
      const courses = await Course.findAll({
        attributes: ['id', 'title', 'description']
      });
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
sequelize.sync({ alter: true })
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