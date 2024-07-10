const sequelize = require("../config/database.js");
const User = require("./user");
const Course =require("./course");


// define the association between the models

User.hasMany(Course, { as: "Course", foreignkey: "userId" });
Course.belongsTo(User, {as: "Instructor", foreignkey: "userId" });

module.exports = {
    sequelize,
    User,
    Course
}