const { DataTypes } =require("sequelize");
const sequelize = require("../config/database.js");

const Course = sequelize.define("Course", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: "Courses",
    timestamps: true
});


module.exports = Course