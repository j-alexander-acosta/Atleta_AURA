const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve the static PWA files

// Inicializar la base de datos
db.initDb();

// Endpoint para recibir datos de entrenamiento (Cloud AI Processing & Motivation)
app.post('/api/workouts', (req, res) => {
  const { user, log } = req.body;

  if (!user || !log) {
    return res.status(400).json({ error: 'Faltan datos del usuario o del entrenamiento' });
  }

  // 1. Guardar o actualizar el usuario
  // Aquí simulamos el procesamiento de IA actualizando el clúster (podría llamar a clustering.js/py en el futuro)
  if (user.streak > 3) {
    user.assignedCluster = 'Comprometido';
  } else if (user.streak > 0) {
    user.assignedCluster = 'Irregular';
  } else {
    user.assignedCluster = 'Alto riesgo';
  }

  db.saveUser(user, (err) => {
    if (err) console.error("Error guardando usuario:", err);
  });

  // 2. Guardar el registro de entrenamiento
  db.saveLog(log, (err) => {
    if (err) console.error("Error guardando entrenamiento:", err);
  });

  // 3. Generar mensaje de motivación (Motivation Reminders)
  let motivationMessage = "¡Excelente trabajo! Sigue así.";
  if (user.assignedCluster === 'Comprometido') {
    motivationMessage = "¡Eres imparable! Tu constancia está dando frutos.";
  } else if (user.assignedCluster === 'Alto riesgo') {
    motivationMessage = "No te rindas ahora. Cada paso cuenta para alcanzar tu meta.";
  }

  res.json({
    success: true,
    message: 'Entrenamiento registrado en la nube con éxito.',
    motivation: motivationMessage
  });
});

// Endpoint para descargar la base de datos (Admin Only)
app.get('/api/admin/download-db', (req, res) => {
  const secret = req.query.secret;
  
  if (secret !== 'admin123') {
    return res.status(403).json({ error: 'Acceso denegado. Contraseña incorrecta.' });
  }

  res.download(db.dbPath, 'aura_database.sqlite', (err) => {
    if (err) {
      console.error("Error descargando la base de datos:", err);
      res.status(500).send("Error al descargar el archivo.");
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nube AURA corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos administrable en: http://localhost:${PORT}/api/admin/download-db?secret=admin123`);
});
