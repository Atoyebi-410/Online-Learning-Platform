const { DataTypes } =require("sequelize");
const sequelize = require("../config/database.js");

const Course = sequelize.define("Course", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    instructorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, 
{
    tableName: "Courses",
    timestamps: true
}
);




module.exports = Course