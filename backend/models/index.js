const { Sequelize } = require('sequelize');

// Create an SQLite instance (can be switched to MySQL/PostgreSQL)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Database file for SQLite
});

module.exports = sequelize;
