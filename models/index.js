const sequelize = require("../config/database.js");
const User = require("./user");
const Course =require("./course");
const Lesson = require('./lesson.js')
const Enrollment = require('./enrollment.js')


// define the association between the models

User.hasMany(Course, { as: "Course", foreignkey: "userId" });
Course.belongsTo(User, {as: "Instructor", foreignkey: "userId" });

// Course and Lesson association
Course.hasMany(Lesson, { as: "Lessons", foreignKey: "courseId" });
Lesson.belongsTo(Course, { as: "Course", foreignKey: "courseId" });

User.belongsToMany(Course, { through: Enrollment, as: 'enrolledCourses', foreignKey: 'userId' });
Course.belongsToMany(User, { through: Enrollment, as: 'students', foreignKey: 'courseId' });

module.exports = {
    sequelize,
    User,
    Course,
    Lesson,
    Enrollment
}