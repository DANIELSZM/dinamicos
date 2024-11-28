const express = require('express');
const bodyParser = require('body-parser'); // CommonJS no necesita ajustes
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db'); // Asegúrate de que ./db.js use CommonJS
require('dotenv').config(); // Configuración de dotenv

// Modelo para las mediciones
const mediciones = sequelize.define('mediciones', {
    humedad: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    temperatura: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },

},
    {
        timestamps: false, // Deshabilita createdAt y updatedAt
        tableName: 'mediciones', // Asegúrate de que coincida con el nombre de tu tabla en la base de datos
    }
);

// Verificar conexión a la base de datos
sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos exitosa.');

        // Sincronizar los modelos con la base de datos
        sequelize.sync({ force: false }) // Si estás en desarrollo, puedes usar 'force: true' para reiniciar las tablas
            .then(() => console.log('Base de datos sincronizada correctamente.'))
            .catch(err => console.error('Error sincronizando la base de datos:', err));
    })
    .catch(err => console.error('No se pudo conectar a la base de datos:', err));


setInterval(() => {
    get('https://dinamicos.onrender.com', (res) => {
        console.log(`Ping enviado, status: ${res.statusCode}`);
    });
}, 5 * 60 * 1000); // Cada 5 minutos

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

// Ruta para recibir datos del ESP32
app.post('/api/mediciones', async (req, res) => {
    const { humedad, temperatura } = req.body;

    if (humedad == null || temperatura == null) {
        return res.status(400).json({ error: 'Faltan datos en la solicitud.' });
    }

    try {
        const nuevaMedicion = await mediciones.create({ humedad, temperatura });
        res.status(201).json({ mensaje: 'Medición guardada exitosamente.', medicion: nuevaMedicion });
    } catch (err) {
        console.error('Error al guardar la medición:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});