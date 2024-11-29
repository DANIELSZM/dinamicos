const express = require('express');
const bodyParser = require('body-parser'); // CommonJS no necesita ajustes
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db'); // Asegúrate de que ./db.js use CommonJS
require('dotenv').config(); // Configuración de dotenv
const https = require('https')

// Modelo para las mediciones
const mediciones_in = sequelize.define('mediciones_in', {
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
        tableName: 'mediciones_in', // Asegúrate de que coincida con el nombre de tu tabla en la base de datos
    }
);

//Modelo de mediciones afuera
const mediciones_out = sequelize.define('mediciones_out', {
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
        tableName: 'mediciones_out', // Asegúrate de que coincida con el nombre de tu tabla en la base de datos
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

setInterval(() => {//para que el servicio no se caiga
    try {
        https.get('https://dinamicos.onrender.com', (res) => {
            console.log(`Ping enviado, status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Error en la solicitud: ${err.message}`);
        });
    } catch (error) {
        console.error(`Error inesperado: ${error.message}`);
    }
}, 5 * 60 * 1000); // Cada 5 minutos


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para recibir datos del ESP32
app.post('/api/mediciones', async (req, res) => {
    const { humedad1, temperatura1, humedad2, temperatura2 } = req.body;
    const t = await sequelize.transaction();

    if (humedad1 == null || temperatura1 == null || humedad2 == null || temperatura2 == null) {
        await t.rollback();
        return res.status(400).json({ error: 'Faltan datos en la solicitud.' });
    }

    try {
        const nuevaMedicion1 = await mediciones_in.create({ humedad: humedad1, temperatura: temperatura1 });
        const nuevaMedicion2 = await mediciones_out.create({ humedad: humedad2, temperatura: temperatura2});
        await t.commit();
        res.status(201).json({ 
            mensaje: 'Medición in y medicion out guardadas exitosamente.', 
            medicion: {
                mediciones_in: nuevaMedicion1,
                mediciones_out: nuevaMedicion2
            }
         });
    } catch (err) {
        await t.rollback();
        console.error('Error al guardar las mediciónes:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});