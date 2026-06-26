const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'jacinto.acosta@alumnos.ucn.cl',
    pass: 'npqasuwcthystmwx'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send messages (jacinto.acosta@alumnos.ucn.cl)');
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve the static PWA files

// Inicializar la base de datos
db.initDb();

// Función auxiliar: Validación de RUT Chileno (Módulo 11)
function validarRut(rutCompleto) {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) return false;
  let tmp = rutCompleto.split('-');
  let digv = tmp[1].toLowerCase();
  let rut = tmp[0];
  if (digv == 'K') digv = 'k';

  let M = 0, S = 1;
  for (; rut; rut = Math.floor(rut / 10))
    S = (S + rut % 10 * (9 - M++ % 6)) % 11;
  return S ? S - 1 : 'k' === digv || S ? S - 1 == digv : false; // Ajuste simplificado
}

// Versión más estricta y correcta de Módulo 11:
function isValidRut(rut) {
  if (typeof rut !== 'string') return false;
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanRut.length < 2) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }

  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

  return dv === calculatedDv;
}

function getRunFromRut(rut) {
  if (!rut || typeof rut !== 'string') return '';
  const clean = rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').trim().toUpperCase();
  if (clean.length < 2) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Calcular dígito verificador esperado para el body
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expectedDvVal = 11 - (sum % 11);
  const calculatedDv = expectedDvVal === 11 ? '0' : expectedDvVal === 10 ? 'K' : expectedDvVal.toString();

  if (dv === calculatedDv) {
    return body;
  }
  return clean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'AURA_FITNESS_SECRET_KEY';

// Middleware de Autenticación de Admin
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado o token expirado.' });
    req.admin = user;
    next();
  });
}

// Endpoint de Login Admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Credenciales incompletas.' });

  db.getAdminByUsername(username, async (err, admin) => {
    if (err) return res.status(500).json({ error: 'Error de servidor.' });
    if (!admin) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token });
  });
});

// Endpoint Habilitar Usuario (Protegido)
app.post('/api/admin/habilitar-usuario', authenticateAdmin, (req, res) => {
  const { rut, dias_permitidos, es_exento } = req.body;

  if (!rut || !isValidRut(rut)) {
    return res.status(400).json({ error: 'RUT inválido o no proporcionado.' });
  }

  const cleanRut = getRunFromRut(rut);
  const dias = parseInt(dias_permitidos) || 0;

  db.addUsuarioHabilitado(cleanRut, dias, es_exento, (err) => {
    if (err) return res.status(500).json({ error: 'Error al habilitar usuario.' });
    
    // Check if user exists in users table
    db.getUserByRut(cleanRut, (err, user) => {
      if (err) {
        console.error("Error verificando usuario:", err);
        return res.status(500).json({ error: 'Error interno verificando usuario.' });
      }

      if (!user) {
        // Create initial record
        const newUser = {
          id: 'user-' + Date.now(),
          name: 'Nuevo Atleta',
          age: 0,
          sex: 'male',
          weight: 0,
          height: 0,
          goal: '',
          level: 'principiante',
          streak: 0,
          assignedCluster: 'Pendiente',
          profileType: 'estudiante',
          rut: cleanRut
        };
        db.saveUser(newUser, (saveErr) => {
          if (saveErr) console.error("Error creating initial user:", saveErr);
          res.json({ success: true, message: 'Usuario habilitado y registrado correctamente.' });
        });
      } else {
        res.json({ success: true, message: 'Usuario habilitado correctamente.' });
      }
    });
  });
});

// Endpoint Validar Habilitación (Público, usado en Onboarding)
app.get('/api/check-habilitacion', (req, res) => {
  const rut = req.query.rut;
  if (!rut || !isValidRut(rut)) {
    return res.status(400).json({ valid: false, error: 'RUT inválido' });
  }

  const cleanRut = getRunFromRut(rut);
  db.checkHabilitacion(cleanRut, (err, row) => {
    if (err) return res.status(500).json({ valid: false, error: 'Error de servidor' });

    if (!row) {
      return res.json({ valid: false, message: 'RUT no encontrado en la lista de habilitados.' });
    }

    if (!row.es_exento && row.dias_permitidos <= 0) {
      return res.json({ valid: false, message: 'RUT sin días de acceso disponibles.' });
    }

    db.getUserByRut(cleanRut, (err, user) => {
      if (err) {
        console.error("Error buscando usuario por RUT:", err);
        return res.status(500).json({ valid: false, error: 'Error de servidor al validar usuario' });
      }
      
      const userId = user ? user.id : 'user-' + Date.now();
      res.json({ 
        valid: true, 
        message: 'RUT habilitado.', 
        userId: userId 
      });
    });
  });
});

// Endpoint para recibir datos de entrenamiento (Cloud AI Processing & Motivation)
app.post('/api/workouts', (req, res) => {
  const { user, log } = req.body;

  if (!user || !user.rut) {
    return res.status(400).json({ error: 'Faltan datos del usuario o RUT' });
  }

  const cleanRut = getRunFromRut(user.rut);

  // Validar contra usuarios_habilitados antes de guardar el usuario
  db.checkHabilitacion(cleanRut, (err, habilitado) => {
    if (err) return res.status(500).json({ error: 'Error de servidor validando RUT' });

    if (!habilitado || (!habilitado.es_exento && habilitado.dias_permitidos <= 0)) {
      return res.status(403).json({ error: 'RUT no habilitado o sin días disponibles' });
    }

    // 1. Guardar o actualizar el usuario
    if (user.streak > 3) {
      user.assignedCluster = 'Comprometido';
    } else if (user.streak > 0) {
      user.assignedCluster = 'Irregular';
    } else {
      user.assignedCluster = 'Alto riesgo';
    }

    user.rut = cleanRut;
    db.saveUser(user, (err) => {
      if (err) console.error("Error guardando usuario:", err);
    });

    // 2. Guardar el registro de entrenamiento
    if (log) {
      db.saveLog(log, (err) => {
        if (err) console.error("Error guardando entrenamiento:", err);
      });

      // Guardar detalle de esfuerzo real
      if (log.sets && Array.isArray(log.sets)) {
        log.sets.forEach(set => {
          if (set.completed && set.exerciseName) {
            db.saveProgression(user.id, set.exerciseName, set.weight || 0, set.reps || 0, (err) => {
              if (err) console.error("Error guardando progresión:", err);
            });
          }
        });
      }
    }

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
  }); // Fin callback db.checkHabilitacion
});

// Endpoint para registrar asistencia (QR o manual)
app.post('/api/attendance', (req, res) => {
  const att = req.body;
  if (!att || !att.userId) {
    return res.status(400).json({ error: 'Faltan datos para registrar asistencia' });
  }

  db.saveAttendance(att, (err) => {
    if (err) {
      console.error("Error registrando asistencia:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, message: 'Asistencia registrada con éxito.' });
  });
});

// Endpoint para consultar asistencia
app.get('/api/attendance', (req, res) => {
  db.getAttendanceList((err, rows) => {
    if (err) {
      console.error("Error listando asistencia:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, attendance: rows });
  });
});

// Endpoint Histórico de Asistencia (Admin)
app.get('/api/admin/attendance-history', authenticateAdmin, (req, res) => {
  db.getAttendanceHistory((err, rows) => {
    if (err) {
      console.error("Error obteniendo histórico de asistencia:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, history: rows });
  });
});
// Endpoint para obtener todos los usuarios de la base de datos real
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  db.getAllUsers((err, rows) => {
    if (err) {
      console.error("Error obteniendo usuarios reales:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, users: rows });
  });
});

// Endpoint para obtener el estado de todos los usuarios habilitados
app.get('/api/admin/users-status', authenticateAdmin, (req, res) => {
  db.getAllHabilitaciones((err, rows) => {
    if (err) {
      console.error("Error obteniendo habilitaciones:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, habilitaciones: rows });
  });
});


// Endpoint para consultar rutinas completas con ejercicios y máquinas (Dinámico)
app.get('/api/routines', (req, res) => {
  db.getRoutinesWithExercisesAndMachines((err, rows) => {
    if (err) {
      console.error("Error al consultar rutinas:", err);
      return res.status(500).json({ error: "Error de base de datos" });
    }

    const routines = {};

    rows.forEach(row => {
      const rId = row.routine_id;
      if (!routines[rId]) {
        routines[rId] = {
          name: row.routine_name,
          duration: row.routine_duration,
          exercises: []
        };
      }

      let instructions = [];
      try {
        instructions = JSON.parse(row.exercise_instructions || '[]');
      } catch (e) {
        console.error("Error parseando instrucciones:", e);
      }

      let sets = [];
      try {
        sets = JSON.parse(row.exercise_sets || '[]');
      } catch (e) {
        console.error("Error parseando sets:", e);
      }

      const exercise = {
        name: row.exercise_name,
        muscle: row.exercise_muscle,
        animationClass: row.exercise_animationClass,
        videoUrl: row.exercise_videoUrl,
        instructions: instructions,
        sets: sets
      };

      if (row.maquina_id) {
        exercise.machine = {
          id: row.maquina_id,
          name: row.maquina_name,
          description: row.maquina_desc,
          zone: row.maquina_zona
        };
      } else {
        exercise.machine = null;
      }

      routines[rId].exercises.push(exercise);
    });

    res.json({ success: true, routines });
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

// --- SISTEMA DE ASISTENCIA CÓDIGO BARRAS DINÁMICO ---
const crypto = require('crypto');
const activeTokens = new Map();

// Limpiar tokens expirados cada minuto
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (data.expiresAt < now) {
      activeTokens.delete(token);
    }
  }
}, 60000);

// 1. Endpoint para generar el token corto dinámico
app.get('/api/asistencia/token', async (req, res) => {
  try {
    const usuario_id = req.query.usuario_id;
    if (!usuario_id) {
      console.error("Error: Petición de token sin usuario_id");
      return res.status(400).json({ success: false, error: 'usuario_id es requerido' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'AURA_FITNESS_SECRET_KEY';
    // Generar JWT con expiración estricta de 30 segundos
    const token = jwt.sign({ usuario_id }, JWT_SECRET, { expiresIn: '30s' });

    // Guardar en memoria con expiración estricta de 30 segundos
    activeTokens.set(token, {
      usuario_id: usuario_id,
      expiresAt: Date.now() + 30000
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error crítico al generar JWT:", error);
    res.status(500).json({ success: false, error: 'Error interno del servidor al generar el token' });
  }
});

// 2. Endpoint exclusivo para recepción para escanear y hacer check-in
app.post('/api/asistencia/check-in', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'Token no proporcionado' });

  // Validar el token en memoria
  const tokenData = activeTokens.get(token);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    if (tokenData) activeTokens.delete(token);
    return res.status(401).json({ success: false, error: 'Código expirado o inválido' });
  }

  const usuario_id = tokenData.usuario_id;
  // Eliminar el token inmediatamente para evitar re-uso
  activeTokens.delete(token);

  // Verificar margen de 1 hora para evitar duplicados
  db.obtenerUltimaAsistenciaUsuario(usuario_id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error consultando asistencia previa' });
    }

    if (row && row.fecha_hora) {
      // SQLite guarda DATETIME DEFAULT CURRENT_TIMESTAMP en UTC, Date.parse lo toma bien o requiere 'Z'
      const lastTime = new Date(row.fecha_hora + 'Z').getTime();
      const now = new Date().getTime();
      const diffMs = now - lastTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 1) {
        return res.status(409).json({ error: 'Registro duplicado. Ya has registrado asistencia en la última hora.' });
      }
    }

    // Registrar asistencia en DB
    db.registrarAsistenciaQR(usuario_id, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al registrar asistencia en base de datos' });
      }

      // Buscar el RUT del usuario y descontar días
      db.getUserById(usuario_id, (err, rowUser) => {
        if (!err && rowUser && rowUser.rut) {
          db.decrementarDiasPermitidos(rowUser.rut, () => {
            res.json({ success: true, message: 'Acceso Concedido' });
          });
        } else {
          res.json({ success: true, message: 'Acceso Concedido' });
        }
      });
    });
  });
});

// (Endpoints limpios y consolidados arriba)

// Endpoints de Notificaciones
app.post('/api/admin/send-alert', authenticateAdmin, (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: 'Faltan datos.' });

  db.getUserById(userId, (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    db.saveWebNotification(userId, message, (err, notifId) => {
      if (err) return res.status(500).json({ error: 'Error guardando notificación.' });

      if (user.email && transporter) {
        const mailOptions = {
          from: '"GYM-UCN Admin" <jacinto.acosta@alumnos.ucn.cl>',
          to: user.email,
          subject: 'Alerta de Recuperación - GYM-UCN',
          text: message,
          html: `<p>Hola ${user.name},</p><p>${message}</p><p>El Equipo GYM-UCN</p>`
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error enviando correo:', err);
            return res.status(500).json({ error: 'Error al enviar correo: ' + err.message });
          } else {
            console.log('Correo enviado con éxito:', info.messageId);
            return res.json({ success: true, message: 'Alerta y correo enviados con éxito.', notifId });
          }
        });
      } else {
        return res.json({ success: true, message: 'Alerta generada en web con éxito (sin correo).', notifId });
      }
    });
  });
});

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId.' });

  db.getUnreadNotifications(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error de base de datos.' });
    res.json({ success: true, notifications: rows || [] });
  });
});

// Endpoint para obtener la progresión (historial de esfuerzo real) de un atleta
app.get('/api/progression', (req, res) => {
  const { userId, exerciseName } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  db.getProgressionHistory(userId, exerciseName, (err, rows) => {
    if (err) {
      console.error("Error obteniendo progresión:", err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json({ success: true, progression: rows || [] });
  });
});

app.post('/api/notifications/read', (req, res) => {
  const { notificationId } = req.body;
  if (!notificationId) return res.status(400).json({ error: 'Falta notificationId.' });

  db.markNotificationAsRead(notificationId, (err) => {
    if (err) return res.status(500).json({ error: 'Error actualizando notificación.' });
    res.json({ success: true });
  });
});
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nube AURA corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos administrable en: http://localhost:${PORT}/api/admin/download-db?secret=admin123`);
});
