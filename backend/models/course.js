import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Course = sequelize.Define("Course", {
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