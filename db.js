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
    timezone: '-05:00', // Cambia esto a tu zona horaria local (Ejemplo: Colombia es -05:00)
});

console.log(process.env.DATABASE_URL);

module.exports = sequelize;
