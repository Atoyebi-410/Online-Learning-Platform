// deleteUser.js
const sequelize = require('./config/database');
const User = require('./models/user');

async function deleteUserByEmail(email) {
  try {
    await User.destroy({ where: { email } });
    console.log(`User with email ${email} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await sequelize.close();
  }
}

// Replace with the email you want to delete
deleteUserByEmail('ibrahimolanrewaju2@gmail.com');
