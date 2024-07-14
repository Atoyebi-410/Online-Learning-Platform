const express = require('express');
const userRoutes = require("./routes/userRoute.js");
const authRoutes = require('./routes/authRoute.js');
const sequelize = require("./config/database.js");
const passport = require('./passport.js');
const session = require('express-session');
require('dotenv').config();

const app = express();

// middleware to parse JSON
app.use(express.json());

// middleware to make static files readable
// app.use(express.static("../frontend/public"));

// Initialize session
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// use routes
app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes)


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