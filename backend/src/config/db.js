const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Use SQLite for simple local setup without needing Postgres installed
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite Database Connected.');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database Models Synced.');
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

module.exports = { sequelize, connectDB };
