require('dotenv').config(); // Load .env file
const { Sequelize } = require('sequelize');

// Initialize Sequelize with MySQL configuration
const sequelize = new Sequelize(
  process.env.MYSQL_ADDON_DB,
  process.env.MYSQL_ADDON_USER,
  process.env.MYSQL_ADDON_PASSWORD,
  {
    host: process.env.MYSQL_ADDON_HOST,
    dialect: 'mysql',
    port: process.env.MYSQL_ADDON_PORT,
  }
);

module.exports = sequelize;
