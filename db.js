const { Sequelize } = require('sequelize');
require('dotenv').config(); // Configuración de dotenv

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Solo si Render lo requiere
        },
    },
});

console.log(process.env.DATABASE_URL);

module.exports = sequelize;
