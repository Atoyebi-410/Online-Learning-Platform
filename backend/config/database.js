import { Sequelize } from "sequelize";
import 'dotenv/onfig';

const sequelize = new Sequelize (process.env.DB_NAME, process.env.DB_USER, process.env.DB_pass, {
    host: process.env.DB_HOST,
    dialect: "postgres"
});

module.exports = sequelize;