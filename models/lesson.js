// models/lesson.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./course');

const Lesson = sequelize.define('Lesson', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
}, {
  timestamps: true,
});

// Define relationships
// Course.hasMany(Lesson, { foreignKey: 'courseId', onDelete: 'CASCADE' });
// Lesson.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });

module.exports = Lesson;
