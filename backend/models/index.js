import sequelize from "../config/database";
import User from "./user";
import Course from "./course";
import { FOREIGNKEYS } from "sequelize/lib/query-types";

// define the association between the models

User.hasMany(Course, { as: "course", foreignkey: "userid" });
Course.belongsTo(User, {as: "instructor", foreignkey: "userid" });

module.exports = {
    sequelize,
    User,
    Course
}