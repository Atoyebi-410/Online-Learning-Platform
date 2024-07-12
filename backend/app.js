const express = require('express');
const userRoutes = require("./routes/userRoute.js");
const sequelize = require("./config/database.js");
require('dotenv').config();

const app = express();

// middleware to make static files readable
// app.use(express.static("../frontend/public"));

// middleware to parse JSON
app.use(express.json());

// use routes
app.use("/api", userRoutes);
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000;

sequelize.sync({force: false}).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}).catch((error) => {
    console.error(`unable to connect to the database:`, error);
});

// app.get("/", (req, res) => {
//     res.render("../../frontend/views/index.ejs")
// })




// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })