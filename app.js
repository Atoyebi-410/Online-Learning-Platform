const express = require('express');
const authRoutes = require('./routes/authRoute.js');
const sequelize = require("./config/database.js");
const passport = require('./passport.js');
const session = require('express-session');
const courseRoutes = require('./routes/courseRoute');
const lessonRoutes = require('./routes/lessonRoute');
const bodyParser = require('body-parser');
const Course = require('./models/course.js');
const User = require('./models/user.js')
const cookieParser = require('cookie-parser');
const path = require('path')
const flash = require('connect-flash');
const Enrollment = require('./models/enrollment.js')
const {authMiddleware, checkRole} = require('./middleware/authMiddleware.js');
require('dotenv').config();
require('./models/index.js')

const app = express();

// set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware tp parse json
app.use(express.json());

app.use(flash());

// Middleware to make static files readable
app.use(express.static('public'));

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
      res.render('index', { courses });
  } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


app.get('/register', (req, res) => {
  res.render('register', { messages: req.flash() || {} });
});

// render login page
app.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() || {} });
});

// // render upload page
// app.get('/upload', (req, res) => {
//   res.render('../../frontend/views/upload.ejs', { message: req.flash('message') });
// });

// Route to render the upload page
app.get('/upload', authMiddleware, checkRole('instructor'), async (req, res) => {
  try {
      const courses = await Course.findAll({ where: { instructorId: req.user.id } });
      res.render('upload', { courses, error: req.flash('error'), success: req.flash('success') });
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
      return res.redirect('upload');
    }
    res.render('editCourse', { course });
  } catch (error) {
    console.error('Error fetching course:', error);
    req.flash('error', 'Server error');
    res.redirect('upload');
  }
});


app.get('/courses', authMiddleware, async (req, res) => {
  try {
      const courses = await Course.findAll({
        attributes: ['id', 'title', 'description']
      });

      // Fetch enrolled courses for the logged-in user
      const userWithCourses = await User.findByPk(req.user.id, {
        include: [
          {
            model: Course,
            as: 'enrolledCourses', // This should match the alias defined in the associations
            attributes: ['id', 'title', 'description']
          }
        ]
      });

      // Extract enrolled courses
      const myCoursesList = userWithCourses.enrolledCourses;

      // const myCourses = await Enrollment.findAll({
      //   where: { studentId: req.user.id },
      //   include: [
      //     {
      //       model: Course,
      //       attributes: ['id', 'title', 'description'],
      //       as: 'enrolledCourses'
      //     }
      //   ]
      // });

      // const myCoursesList = myCourses.map(enrollment => enrollment.enrolledCourses);

      res.render('courses', { 
        courses, 
        myCourses: myCoursesList,
        loggedIn: req.isAuthenticated() 
      });
  } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


app.get('/logout', (req, res) => {
  // Clear any session/token information from client-side storage (e.g., cookies, localStorage)
  res.clearCookie('jwtToken'); // Example for clearing cookie-based token
  res.status(200).render('index', { message: 'Logout successful' });
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