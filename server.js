const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const https = require('https');

// Configuración de la base de datos
const sequelize = new Sequelize('dinamicos', 'root', 'mecdan187', {
    host: 'localhost',
    dialect: 'mysql',
});

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

/*setInterval(() => {
    https.get('https://tu-servidor.onrender.com', (res) => {
      console.log(`Ping enviado, status: ${res.statusCode}`);
    });
  }, 5 * 60 * 1000); // Cada 5 minutos
*/
// Sincronización con la base de datos
sequelize.sync()
    .then(() => console.log('Base de datos sincronizada.'))
    .catch(err => console.error('Error sincronizando la base de datos:', err));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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