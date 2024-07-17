const express = require('express');
const authRoutes = require('./routes/authRoute.js');
const sequelize = require("./config/database.js");
const passport = require('./passport.js');
const session = require('express-session');
const courseRoutes = require('./routes/courseRoute');
const lessonRoutes = require('./routes/lessonRoute');
const bodyParser = require('body-parser');
const path = require('path')
require('dotenv').config();

const app = express();

// set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware tp parse json
app.use(express.json());

// middleware to make static files readable
// app.use(express.static("../frontend/public"));

// Middleware to make static files readable
app.use(express.static(path.join(__dirname, 'public')));

// Initialize session
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());

// use routes
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);


// app.get("/", (req, res) => {
//     res.render("../../frontend/views/index.ejs")
// })


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