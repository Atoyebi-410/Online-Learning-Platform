import sequelize from "../config/database";
import User from "./user";
import Course from "./course";


// define the association between the models

User.hasMany(Course, { as: "Course", foreignkey: "userId" });
Course.belongsTo(User, {as: "Instructor", foreignkey: "userId" });

module.exports = {
    sequelize,
    User,
    Course
}