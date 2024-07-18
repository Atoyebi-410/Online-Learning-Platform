// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('Courses');
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Courses', {
//       id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       title: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       instructorId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       createdAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       },
//       updatedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//       },
//     });
//   }
// };

