const sequelize = require("../config/database.js");
const { DataTypes } = require("sequelize");
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('student', 'instructor'),
        allowNull: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: "Users",
    timestamp: true,
    // hooks: {
    //     beforeCreate: async (user) => {
    //         const salt = await bcrypt.genSalt(10);
    //         user.password = await bcrypt.hash(user.password, salt);
    //     }
    // }
});

module.exports = User;