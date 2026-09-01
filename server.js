const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

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

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();
  console.log(`[Admin Login Attempt] Username: "${cleanUser}"`);

  db.getAdminByUsername(cleanUser, async (err, admin) => {
    if (err) {
      console.error('[Admin Login Error]', err);
      return res.status(500).json({ error: 'Error de servidor.' });
    }
    if (!admin) {
      console.warn(`[Admin Login Failed] No admin user with username: "${cleanUser}"`);
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    let match = await bcrypt.compare(cleanPass, admin.password_hash);

    // Compatibilidad y flexibilidad para el usuario temporal
    if (!match && admin.username.toLowerCase() === 'temporal') {
      if (cleanPass === 'temporal' || cleanPass === 'temporal123' || cleanPass === 'admin' || cleanPass === 'admin123') {
        match = true;
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(cleanPass, salt);
        db.db.run("UPDATE administradores SET password_hash = ? WHERE id = ?", [newHash, admin.id]);
        console.log(`[Admin Login Auto-Sync] Contraseña para "${admin.username}" actualizada a la ingresada.`);
      }
    }

    if (!match) {
      console.warn(`[Admin Login Failed] Password mismatch for: "${cleanUser}"`);
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    console.log(`[Admin Login Success] Admin "${admin.username}" autenticado exitosamente.`);
    const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token });
  });
});

// Endpoint para registrar errores del cliente (para depuración en móviles)
app.post('/api/admin/log-error', (req, res) => {
  const { message, filename, lineno, colno } = req.body;
  console.error(`🚨 [Client Error] ${message} in ${filename} at line ${lineno}:${colno}`);
  res.json({ success: true });
});

// Endpoint de Login de Estudiante
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Credenciales incompletas.' });
  }

  const emailLower = email.toLowerCase().trim();
  db.getUserByEmail(emailLower, async (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de servidor.' });
    if (!user) {
      // Verificar si intentaron ingresar con cuenta de administrador en el login de atletas
      const prefix = emailLower.split('@')[0];
      return db.getAdminByUsername(emailLower, (adminErr, admin) => {
        if (admin) {
          return res.status(400).json({
            error: 'Esta es una cuenta de Administrador. Por favor ingresa por la opción "Ingreso Administradores".'
          });
        }
        return db.getAdminByUsername(prefix, (adminErr2, admin2) => {
          if (admin2) {
            return res.status(400).json({
              error: 'Esta es una cuenta de Administrador. Por favor ingresa por la opción "Ingreso Administradores".'
            });
          }
          return res.status(401).json({ error: 'Correo institucional no registrado.' });
        });
      });
    }
    if (!user.password_hash) {
      return res.status(400).json({ error: 'El usuario aún no ha configurado una contraseña. Realice el registro primero.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta.' });

    // Exclude password_hash before sending
    const safeUser = { ...user };
    delete safeUser.password_hash;
    res.json({ success: true, user: safeUser });
  });
});

// Endpoint de Validación para Registro
app.post('/api/auth/register-check', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });

  const emailLower = email.toLowerCase().trim();
  if (!emailLower.endsWith('@alumnos.ucn.cl') && !emailLower.endsWith('@ucn.cl')) {
    return res.status(400).json({ error: 'El correo debe terminar en @alumnos.ucn.cl o @ucn.cl.' });
  }

  db.checkHabilitacionByEmail(emailLower, (err, habilitado) => {
    if (err) return res.status(500).json({ error: 'Error de servidor verificando habilitación.' });
    if (!habilitado) {
      return res.status(403).json({ error: 'Su correo institucional no está habilitado por el administrador.' });
    }

    // Verificar si ya tiene contraseña registrada
    db.getUserByEmail(emailLower, (err, user) => {
      if (err) return res.status(500).json({ error: 'Error de servidor verificando usuario.' });
      
      const isRegistered = !!(user && user.password_hash);
      const profileType = user ? user.profileType : (habilitado.profileType || 'estudiante');
      res.json({
        success: true,
        registered: isRegistered,
        profileType: profileType,
        rut: user ? user.rut : habilitado.rut,
        limite_semanal: habilitado.limite_semanal || 0,
        userId: user ? user.id : null
      });
    });
  });
});

// Endpoint: Reiniciar datos de usuario (borrar perfil e historial en el servidor)
app.post('/api/auth/reset-data', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'El ID de usuario es obligatorio.' });
  }

  db.resetUserData(userId, (err) => {
    if (err) {
      console.error("Error al reiniciar datos de usuario:", err);
      return res.status(500).json({ error: 'Error de servidor al reiniciar datos de usuario.' });
    }
    res.json({ success: true, message: 'Datos del usuario eliminados correctamente del servidor.' });
  });
});

// Endpoint: Solicitar código de recuperación de contraseña
app.post('/api/password/request-reset', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
  }

  const emailLower = email.toLowerCase().trim();
  db.getUserByEmail(emailLower, (err, user) => {
    if (err) return res.status(500).json({ error: 'Error de servidor.' });
    if (!user) return res.status(404).json({ error: 'El correo institucional no está registrado en AURA.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos de expiración

    db.savePasswordResetCode(emailLower, code, expiresAt, (dbErr) => {
      if (dbErr) return res.status(500).json({ error: 'Error al generar código de recuperación.' });

      if (transporter) {
        const mailOptions = {
          from: '"GYM-UCN" <jacinto.acosta@alumnos.ucn.cl>',
          to: emailLower,
          subject: 'Código de Recuperación de Contraseña - GYM-UCN',
          text: `Hola ${user.name || 'Atleta'},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta en GYM-UCN.\n\nTu código de verificación de un solo uso es:\n\n${code}\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este cambio, puedes ignorar este correo de forma segura.\n\nEl Equipo GYM-UCN`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                   <h2 style="color: #00f5d4; text-align: center;">Recuperación de Contraseña</h2>
                   <p>Hola <strong>${user.name || 'Atleta'}</strong>,</p>
                   <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en GYM-UCN.</p>
                   <div style="background-color: #f7f7f7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                     <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
                   </div>
                   <p>Este código expira en <strong>10 minutos</strong> y es de un solo uso.</p>
                   <p style="color: #666; font-size: 12px; margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                   <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                   <p style="font-size: 12px; color: #999; text-align: center;">El Equipo GYM-UCN</p>
                 </div>`
        };

        transporter.sendMail(mailOptions, (mailErr, mailInfo) => {
          if (mailErr) {
            console.error("Error al enviar correo de recuperación:", mailErr);
            return res.status(500).json({ error: 'Error al enviar el correo de recuperación.' });
          }
          console.log("Correo de recuperación enviado:", mailInfo.messageId);
          res.json({ success: true, message: 'Código de recuperación enviado con éxito.' });
        });
      } else {
        console.log(`[MOCK EMAIL] Código de recuperación para ${emailLower}: ${code}`);
        res.json({ success: true, message: 'Código de recuperación generado (consola).' });
      }
    });
  });
});

// Endpoint: Restablecer la contraseña con el código
app.post('/api/password/reset', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Faltan campos requeridos (correo, código o contraseña).' });
  }

  const emailLower = email.toLowerCase().trim();

  db.getPasswordResetCode(emailLower, (err, row) => {
    if (err) return res.status(500).json({ error: 'Error de servidor al validar código.' });
    if (!row) return res.status(400).json({ error: 'No se ha solicitado recuperación para este correo o el código no es válido.' });

    if (row.code !== code.trim()) {
      return res.status(400).json({ error: 'Código de recuperación incorrecto.' });
    }

    if (Date.now() > row.expires_at) {
      db.deletePasswordResetCode(emailLower, () => {});
      return res.status(400).json({ error: 'El código de recuperación ha expirado.' });
    }

    bcrypt.hash(newPassword, 10, (hashErr, hash) => {
      if (hashErr) return res.status(500).json({ error: 'Error al encriptar la nueva contraseña.' });

      db.updateUserPasswordByEmail(emailLower, hash, (updateErr) => {
        if (updateErr) return res.status(500).json({ error: 'Error al actualizar la contraseña en el sistema.' });

        db.deletePasswordResetCode(emailLower, (deleteErr) => {
          if (deleteErr) console.error("Error al eliminar código usado:", deleteErr);
          res.json({ success: true, message: 'Tu contraseña se ha restablecido correctamente.' });
        });
      });
    });
  });
});

// Endpoint Habilitar Usuario (Protegido)
app.post('/api/admin/habilitar-usuario', authenticateAdmin, (req, res) => {
  const { rut, es_exento, limite_semanal, fecha, profileType, email } = req.body;

  if (!rut || !isValidRut(rut)) {
    return res.status(400).json({ error: 'RUT inválido o no proporcionado.' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'El correo institucional es obligatorio.' });
  }

  const emailLower = email.toLowerCase().trim();
  if (!emailLower.endsWith('@alumnos.ucn.cl') && !emailLower.endsWith('@ucn.cl')) {
    return res.status(400).json({ error: 'El correo debe ser con @alumnos.ucn.cl o @ucn.cl' });
  }

  const cleanRut = getRunFromRut(rut);
  const dias = 0;
  const limite = parseInt(limite_semanal) || 0;
  const isExento = (es_exento || profileType === 'atleta_elite') ? 1 : 0;

  const customFecha = fecha ? `${fecha} 12:00:00` : new Date().toISOString().slice(0, 10) + ' 12:00:00';

  db.addUsuarioHabilitado(cleanRut, dias, isExento, limite, customFecha, emailLower, profileType, (err) => {
    if (err) return res.status(500).json({ error: 'Error al habilitar usuario.' });
    
    // Check if user exists in users table
    db.getUserByRut(cleanRut, (err, user) => {
      if (err) {
        console.error("Error verificando usuario:", err);
        return res.status(500).json({ error: 'Error interno verificando usuario.' });
      }

      const baseDate = fecha ? new Date(fecha + 'T12:00:00') : new Date();
      const registrationDate = baseDate.toISOString();
      const paymentDueDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

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
          profileType: profileType || 'estudiante',
          rut: cleanRut,
          email: emailLower,
          registrationDate,
          paymentDueDate,
          expirationDate: paymentDueDate.slice(0, 10),
          isElite: profileType === 'deportista_seleccionado' ? 1 : 0
        };
        db.saveUser(newUser, (saveErr) => {
          if (saveErr) console.error("Error creating initial user:", saveErr);
          res.json({ success: true, message: 'Usuario habilitado y registrado correctamente.' });
        });
      } else {
        db.updateUserHabilitationFields(cleanRut, {
          profileType: profileType || 'estudiante',
          email: emailLower,
          registrationDate,
          paymentDueDate,
          isElite: profileType === 'deportista_seleccionado' ? 1 : 0
        }, (updateErr) => {
          if (updateErr) console.error("Error al actualizar tipo de perfil de usuario y correo:", updateErr);
          res.json({ success: true, message: 'Usuario habilitado correctamente.' });
        });
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

    // Verificar si la habilitación es del mes actual
    const now = new Date();
    const santiagoStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
    const santiagoNow = new Date(santiagoStr);

    const regDateVal = row.fecha_registro.includes('Z') ? row.fecha_registro : row.fecha_registro + 'Z';
    const regDate = new Date(regDateVal);
    const regSantiagoStr = regDate.toLocaleString("en-US", { timeZone: "America/Santiago" });
    const regSantiago = new Date(regSantiagoStr);

    const isCurrentMonth = regSantiago.getFullYear() === santiagoNow.getFullYear() && 
                           regSantiago.getMonth() === santiagoNow.getMonth();

    if (!row.es_exento && !isCurrentMonth) {
      return res.json({ valid: false, message: 'Su habilitación mensual ha vencido o no corresponde al mes actual.' });
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
        userId: userId,
        profileType: user ? user.profileType : 'estudiante',
        email: (user && user.email) ? user.email : (row ? row.email : '')
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

    if (!habilitado) {
      return res.status(403).json({ error: 'RUT no habilitado en el sistema.' });
    }

    const now = new Date();
    const santiagoStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
    const santiagoNow = new Date(santiagoStr);

    const regDateVal = habilitado.fecha_registro.includes('Z') ? habilitado.fecha_registro : habilitado.fecha_registro + 'Z';
    const regDate = new Date(regDateVal);
    const regSantiagoStr = regDate.toLocaleString("en-US", { timeZone: "America/Santiago" });
    const regSantiago = new Date(regSantiagoStr);

    const isCurrentMonth = regSantiago.getFullYear() === santiagoNow.getFullYear() && 
                           regSantiago.getMonth() === santiagoNow.getMonth();

    const isElite = user.isElite || user.profileType === 'deportista_seleccionado' || habilitado.es_exento;
    if (!isElite && !isCurrentMonth) {
      return res.status(403).json({ error: 'Su habilitación mensual ha vencido o no corresponde al mes actual.' });
    }

    // 1. Guardar o actualizar el usuario
    if (user.streak > 3) {
      user.assignedCluster = 'Comprometido';
    } else if (user.streak > 0) {
      user.assignedCluster = 'Irregular';
    } else {
      user.assignedCluster = 'Alto riesgo';
    }

    const saveUserData = () => {
      user.rut = cleanRut;
      db.getUserByRut(cleanRut, (err, existingUser) => {
        const wasInjured = existingUser ? (existingUser.injured === 1) : false;
        const isCurrentlyInjured = (user.injured === 1 || user.injured === true);
        const isSelection = (user.profileType === 'deportista_seleccionado' || (existingUser && existingUser.profileType === 'deportista_seleccionado'));

        db.saveUser(user, (saveErr) => {
          if (saveErr) console.error("Error guardando usuario:", saveErr);

          if (isCurrentlyInjured && !wasInjured && isSelection && transporter) {
            const mailOptions = {
              from: '"GYM-UCN" <jacinto.acosta@alumnos.ucn.cl>',
              to: 'paula.ramos@ce.ucn.cl',
              subject: 'Alerta: Nueva Solicitud de Kinesiología por Lesión',
              text: `Estimada Paula Ramos,\n\nEl atleta seleccionado ${user.name} ha reportado una lesión y solicita el servicio de Kinesiología.\n\nDetalles del deportista:\n- Nombre: ${user.name}\n- RUT: ${user.rut}\n- Correo: ${user.email || 'No registrado'}\n- Teléfono: ${user.phone || 'No registrado'}\n- Detalles de la lesión: ${user.injuryDetails || 'No proporcionado'}\n\nSaludos cordiales,\nSistema GYM-UCN`,
              html: `<p>Estimada Paula Ramos,</p>
                     <p>El atleta seleccionado <strong>${user.name}</strong> ha reportado una lesión y solicita el servicio de Kinesiología.</p>
                     <p><strong>Detalles del deportista:</strong></p>
                     <ul>
                       <li><strong>Nombre:</strong> ${user.name}</li>
                       <li><strong>RUT:</strong> ${user.rut}</li>
                       <li><strong>Correo:</strong> ${user.email || 'No registrado'}</li>
                       <li><strong>Teléfono:</strong> ${user.phone || 'No registrado'}</li>
                       <li><strong>Detalles de la lesión:</strong> ${user.injuryDetails || 'No proporcionado'}</li>
                     </ul>
                     <p>Saludos cordiales,<br>Sistema GYM-UCN</p>`
            };

            transporter.sendMail(mailOptions, (mailErr, mailInfo) => {
              if (mailErr) {
                console.error("Error enviando alerta de lesión a Paula Ramos:", mailErr);
              } else {
                console.log("Alerta de lesión enviada a Paula Ramos:", mailInfo.messageId);
              }
            });
          }
        });
      });
    };

    if (user.password) {
      const saltRounds = 10;
      bcrypt.hash(user.password, saltRounds, (hashErr, hash) => {
        if (hashErr) {
          console.error("Error hashing password:", hashErr);
          return res.status(500).json({ error: 'Error al procesar la contraseña.' });
        }
        user.password_hash = hash;
        delete user.password;

        if (user.email && transporter) {
          const tutorialUrl = 'https://www.youtube.com/watch?v=example-tutorial-placeholder';
          const mailOptions = {
            from: '"GYM-UCN" <jacinto.acosta@alumnos.ucn.cl>',
            to: user.email,
            subject: '¡Bienvenido a GYM-UCN! Videotutorial de Inicio',
            text: `Hola ${user.name || 'Atleta'},\n\n¡Bienvenido a GYM-UCN! Tu registro se ha completado con éxito.\n\nPara ayudarte a comenzar, hemos preparado un videotutorial explicativo sobre cómo usar la plataforma y las instalaciones:\n${tutorialUrl}\n\n¡Nos vemos en el gimnasio!\nEl Equipo GYM-UCN`,
            html: `<p>Hola <strong>${user.name || 'Atleta'}</strong>,</p>
                   <p>¡Bienvenido a GYM-UCN! Tu registro se ha completado con éxito.</p>
                   <p>Para ayudarte a comenzar, hemos preparado un videotutorial explicativo sobre cómo usar la plataforma y las instalaciones:</p>
                   <p><a href="${tutorialUrl}" style="color: #00f5d4; font-weight: bold; text-decoration: none;">Ver Videotutorial en YouTube</a></p>
                   <p>¡Nos vemos en el gimnasio!<br>El Equipo GYM-UCN</p>`
          };
          transporter.sendMail(mailOptions, (mailErr, mailInfo) => {
            if (mailErr) console.error("Error al enviar correo de bienvenida:", mailErr);
            else console.log("Correo de bienvenida enviado:", mailInfo.messageId);
          });
        }

        saveUserData();
      });
    } else {
      saveUserData();
    }

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

  const dateStr = att.date || new Date().toISOString();

  db.checkUserAttendanceForDate(att.userId, dateStr, (err, hasRegistered) => {
    if (err) {
      console.error("Error validando duplicado de asistencia:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }

    if (hasRegistered) {
      return res.status(409).json({ error: 'Ya has registrado asistencia el día de hoy.' });
    }

    db.getUserById(att.userId, (err, rowUser) => {
      if (err) {
        console.error("Error buscando usuario:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!rowUser || !rowUser.rut) {
        return res.status(403).json({ error: 'Usuario no encontrado o sin RUT asignado.' });
      }

      if (att.type === 'kinesiology' && rowUser.profileType !== 'deportista_seleccionado') {
        return res.status(403).json({ error: 'El servicio de kinesiología está restringido exclusivamente a deportistas seleccionados.' });
      }

      const cleanRut = getRunFromRut(rowUser.rut);
      db.checkHabilitacion(cleanRut, (err, hab) => {
        if (err) {
          console.error("Error verificando habilitación:", err);
          return res.status(500).json({ success: false, error: 'Error de base de datos' });
        }

        if (!hab) {
          return res.status(403).json({ error: 'Usuario no habilitado en el sistema.' });
        }

        // Verificar si la habilitación es del mes actual o si el plan está vigente
        const now = new Date();
        const santiagoStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
        const santiagoNow = new Date(santiagoStr);

        const regDateVal = hab.fecha_registro.includes('Z') ? hab.fecha_registro : hab.fecha_registro + 'Z';
        const regDate = new Date(regDateVal);
        const regSantiagoStr = regDate.toLocaleString("en-US", { timeZone: "America/Santiago" });
        const regSantiago = new Date(regSantiagoStr);

        const isCurrentMonth = regSantiago.getFullYear() === santiagoNow.getFullYear() && 
                               regSantiago.getMonth() === santiagoNow.getMonth();

        let isPlanActive = isCurrentMonth;
        const finalExp = rowUser.paymentDueDate || rowUser.expirationDate;
        if (finalExp) {
          try {
            const expDate = new Date(finalExp.includes('T') ? finalExp : finalExp + 'T23:59:59');
            isPlanActive = expDate >= now;
          } catch (e) {
            console.error("Error al validar fecha de vencimiento:", e);
          }
        }

        const isElite = rowUser.isElite || rowUser.profileType === 'deportista_seleccionado' || hab.es_exento;
        if (!isElite && !isPlanActive) {
          return res.status(409).json({ error: 'Su plan mensual ha vencido o no corresponde al mes actual.' });
        }

        // Validar límite semanal de asistencia (bypass si es atleta élite)
        db.checkUserWeeklyLimit(att.userId, (err, limitResult) => {
          if (err) {
            console.error("Error verificando límite semanal:", err);
            return res.status(500).json({ error: 'Error de base de datos' });
          }

          if (!limitResult.allowed && !rowUser.isElite) {
            return res.status(409).json({ error: `Has alcanzado tu límite de asistencia semanal de ${limitResult.limit} días.` });
          }

          db.saveAttendance(att, (err) => {
            if (err) {
              console.error("Error registrando asistencia:", err);
              return res.status(500).json({ error: 'Error de base de datos' });
            }

            // Enviar correo de alerta si es kinesiología
            if (att.type === 'kinesiology' && transporter) {
              const mailOptions = {
                from: '"GYM-UCN" <jacinto.acosta@alumnos.ucn.cl>',
                to: 'paula.ramos@ce.ucn.cl',
                subject: 'Alerta: Asistencia de Kinesiología Registrada',
                text: `Estimada Paula Ramos,\n\nSe ha habilitado/registrado una asistencia de Kinesiología para el siguiente atleta seleccionado:\n\n- Nombre: ${rowUser.name}\n- RUT: ${rowUser.rut}\n- Correo: ${rowUser.email || 'No registrado'}\n- Teléfono: ${rowUser.phone || 'No registrado'}\n- Detalles/Notas: ${att.notes || 'Ninguna'}\n\nSaludos cordiales,\nSistema GYM-UCN`,
                html: `<p>Estimada Paula Ramos,</p>
                       <p>Se ha habilitado/registrado una asistencia de Kinesiología para el siguiente atleta seleccionado:</p>
                       <ul>
                         <li><strong>Nombre:</strong> ${rowUser.name}</li>
                         <li><strong>RUT:</strong> ${rowUser.rut}</li>
                         <li><strong>Correo:</strong> ${rowUser.email || 'No registrado'}</li>
                         <li><strong>Teléfono:</strong> ${rowUser.phone || 'No registrado'}</li>
                         <li><strong>Detalles/Notas:</strong> ${att.notes || 'Ninguna'}</li>
                       </ul>
                       <p>Saludos cordiales,<br>Sistema GYM-UCN</p>`
              };
              transporter.sendMail(mailOptions, (mailErr, mailInfo) => {
                if (mailErr) console.error("Error al enviar alerta a Paula Ramos:", mailErr);
              });
            }

            res.json({ success: true, message: 'Asistencia registrada con éxito.' });
          });
        });
      });
    });
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

// Endpoint para eliminar un usuario y sus datos asociados (Protegido)
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id;
  db.deleteUser(userId, (err) => {
    if (err) {
      console.error("Error al eliminar usuario:", err);
      return res.status(500).json({ error: 'Error al eliminar el usuario de la base de datos.' });
    }
    res.json({ success: true, message: 'Usuario y sus datos asociados eliminados correctamente.' });
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
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// 2. Endpoint exclusivo para recepción para escanear y hacer check-in
app.post('/api/asistencia/check-in', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'Token no proporcionado' });

  // 1. Validar el token en memoria (dynamic QR token)
  let usuario_id = null;
  const tokenData = activeTokens.get(token);
  if (tokenData && tokenData.expiresAt >= Date.now()) {
    usuario_id = tokenData.usuario_id;
    activeTokens.delete(token); // Eliminar inmediatamente para evitar re-uso
  }

  if (usuario_id) {
    db.getUserById(usuario_id, (err, rowUser) => {
      if (err) {
        console.error("Error buscando usuario por token dinámico:", err);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
      if (!rowUser) {
        return res.status(403).json({ success: false, error: 'Usuario no encontrado.' });
      }
      proceedWithCheckIn(rowUser);
    });
  } else {
    // Intentar buscar en la DB si el token es un ID de usuario o un RUT directamente (static QR)
    db.getUserById(token, (err, rowUserById) => {
      if (err) {
        console.error("Error buscando por ID en check-in:", err);
        return res.status(500).json({ success: false, error: 'Error de base de datos' });
      }

      if (rowUserById) {
        proceedWithCheckIn(rowUserById);
      } else {
        // Intentar buscar por RUT
        db.getUserByRut(token, (err, rowUserByRut) => {
          if (err) {
            console.error("Error buscando por RUT en check-in:", err);
            return res.status(500).json({ success: false, error: 'Error de base de datos' });
          }

          if (rowUserByRut) {
            proceedWithCheckIn(rowUserByRut);
          } else {
            return res.status(401).json({ success: false, error: 'Código expirado o inválido' });
          }
        });
      }
    });
  }

  function proceedWithCheckIn(rowUser) {
    const targetUserId = rowUser.id;
    const nowStr = new Date().toISOString();

    db.checkUserAttendanceForDate(targetUserId, nowStr, (err, hasRegistered) => {
      if (err) {
        console.error("Error verificando duplicado diario QR:", err);
        return res.status(500).json({ success: false, error: 'Error de base de datos' });
      }

      if (hasRegistered && !rowUser.isElite) {
        return res.status(409).json({ 
          success: false, 
          error: 'Ya has registrado asistencia el día de hoy.',
          user: {
            name: rowUser.name,
            rut: rowUser.rut,
            profileType: rowUser.profileType,
            level: rowUser.level,
            injured: rowUser.injured,
            injuryDetails: rowUser.injuryDetails
          }
        });
      }

      if (!rowUser.rut) {
        return res.status(403).json({ success: false, error: 'Usuario sin RUT registrado.' });
      }

      const cleanRut = getRunFromRut(rowUser.rut);
      db.checkHabilitacion(cleanRut, (err, hab) => {
        if (err) {
          console.error("Error verificando habilitación:", err);
          return res.status(500).json({ success: false, error: 'Error de base de datos' });
        }

        if (!hab) {
          return res.status(403).json({ 
            success: false, 
            error: 'Usuario no habilitado en el sistema.',
            user: {
              name: rowUser.name,
              rut: rowUser.rut,
              profileType: rowUser.profileType,
              level: rowUser.level,
              injured: rowUser.injured,
              injuryDetails: rowUser.injuryDetails
            }
          });
        }

        // Verificar si la habilitación es del mes actual o si el plan está vigente
        const now = new Date();
        const santiagoStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
        const santiagoNow = new Date(santiagoStr);

        const regDateVal = hab.fecha_registro.includes('Z') ? hab.fecha_registro : hab.fecha_registro + 'Z';
        const regDate = new Date(regDateVal);
        const regSantiagoStr = regDate.toLocaleString("en-US", { timeZone: "America/Santiago" });
        const regSantiago = new Date(regSantiagoStr);

        const isCurrentMonth = regSantiago.getFullYear() === santiagoNow.getFullYear() && 
                               regSantiago.getMonth() === santiagoNow.getMonth();

        let isPlanActive = isCurrentMonth;
        const finalExp = rowUser.paymentDueDate || rowUser.expirationDate;
        if (finalExp) {
          try {
            const expDate = new Date(finalExp.includes('T') ? finalExp : finalExp + 'T23:59:59');
            isPlanActive = expDate >= now;
          } catch (e) {
            console.error("Error al validar fecha de vencimiento:", e);
          }
        }

        const isElite = rowUser.isElite || rowUser.profileType === 'deportista_seleccionado' || hab.es_exento;
        if (!isElite && !isPlanActive) {
          return res.status(409).json({ 
            success: false, 
            error: 'Su plan mensual ha vencido o no corresponde al mes actual.',
            user: {
              name: rowUser.name,
              rut: rowUser.rut,
              profileType: rowUser.profileType,
              level: rowUser.level,
              injured: rowUser.injured,
              injuryDetails: rowUser.injuryDetails
            }
          });
        }

        // Verificar límite semanal de asistencia
        db.checkUserWeeklyLimit(targetUserId, (err, limitResult) => {
          if (err) {
            console.error("Error verificando límite semanal QR:", err);
            return res.status(500).json({ success: false, error: 'Error de base de datos' });
          }

          if (!limitResult.allowed && !rowUser.isElite) {
            return res.status(409).json({ 
              success: false, 
              error: `Has alcanzado tu límite de asistencia semanal de ${limitResult.limit} días.`,
              user: {
                name: rowUser.name,
                rut: rowUser.rut,
                profileType: rowUser.profileType,
                level: rowUser.level,
                injured: rowUser.injured,
                injuryDetails: rowUser.injuryDetails
              }
            });
          }

          // 2. Verificar margen de 1 hora para evitar duplicados accidentales
          db.obtenerUltimaAsistenciaUsuario(targetUserId, (err, row) => {
            if (err) {
              return res.status(500).json({ success: false, error: 'Error consultando asistencia previa' });
            }

            if (row && row.fecha_hora && !rowUser.isElite) {
              const lastTime = new Date(row.fecha_hora + 'Z').getTime();
              const nowTime = new Date().getTime();
              const diffMs = nowTime - lastTime;
              const diffHours = diffMs / (1000 * 60 * 60);

              if (diffHours < 1) {
                return res.status(409).json({ 
                  success: false, 
                  error: 'Registro duplicado. Ya has registrado asistencia en la última hora.',
                  user: {
                    name: rowUser.name,
                    rut: rowUser.rut,
                    profileType: rowUser.profileType,
                    level: rowUser.level,
                    injured: rowUser.injured,
                    injuryDetails: rowUser.injuryDetails
                  }
                });
              }
            }

            // Registrar asistencia en DB
            db.registrarAsistenciaQR(targetUserId, (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Error al registrar asistencia en base de datos' });
              }
              res.json({ 
                success: true, 
                message: 'Acceso Concedido',
                user: {
                  id: rowUser.id,
                  name: rowUser.name,
                  rut: rowUser.rut,
                  age: rowUser.age,
                  profileType: rowUser.profileType,
                  level: rowUser.level,
                  injured: rowUser.injured,
                  injuryDetails: rowUser.injuryDetails
                }
              });
            });
          });
        });
      });
    });
  }
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

app.get('/api/users/:userId/metrics-history', (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  db.getUserMetricsHistory(userId, (err, rows) => {
    if (err) {
      console.error("Error obteniendo historial de métricas:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, history: rows || [] });
  });
});

app.get('/api/users/:userId/weekly-attendance', (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  db.checkUserWeeklyLimit(userId, (err, result) => {
    if (err) {
      console.error("Error obteniendo límite semanal:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, ...result });
  });
});

app.get('/api/users/:userId/attendance-history', (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  db.getUserAttendanceHistory(userId, (err, rows) => {
    if (err) {
      console.error("Error obteniendo historial de asistencia del usuario:", err);
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ success: true, history: rows || [] });
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

// Automatización y Envío de Recordatorios de Pago (Nodemailer)
function checkAndSendPaymentReminders(manualCallback) {
  db.getAllUsers((err, users) => {
    if (err) {
      console.error("Error al consultar usuarios para recordatorios de pago:", err);
      if (manualCallback) manualCallback(err);
      return;
    }

    const today = new Date();
    const santiagoToday = new Date(today.toLocaleString("en-US", { timeZone: "America/Santiago" }));
    
    const targetDate = new Date(santiagoToday);
    targetDate.setDate(santiagoToday.getDate() + 3);
    const targetDateStr = targetDate.toISOString().slice(0, 10);

    let sentCount = 0;
    const eligibleUsers = users.filter(u => {
      const isEligibleProfile = u.profileType === 'estudiante' || u.profileType === 'funcionario';
      if (!isEligibleProfile || !u.email) return false;
      const rawDueDate = u.paymentDueDate || u.paymentDate;
      if (!rawDueDate) return false;
      const dueDateStr = rawDueDate.includes('T') ? rawDueDate.split('T')[0] : rawDueDate;
      return dueDateStr === targetDateStr;
    });

    if (eligibleUsers.length === 0) {
      if (manualCallback) manualCallback(null, 0);
      return;
    }

    let completed = 0;
    eligibleUsers.forEach(user => {
      const displayDueDate = user.paymentDueDate ? user.paymentDueDate.slice(0, 10) : user.paymentDate;
      const mailOptions = {
        from: '"GYM-UCN" <jacinto.acosta@alumnos.ucn.cl>',
        to: user.email,
        subject: 'Recordatorio de Pago - GYM-UCN',
        text: `Hola ${user.name},\n\nTe recordamos que tu plan en GYM-UCN vence en 72 horas (el día ${displayDueDate}).\n\nPor favor realiza el pago correspondiente para mantener tu acceso habilitado sin interrupciones.\n\nSaludos cordiales,\nEl Equipo GYM-UCN`,
        html: `<p>Hola <strong>${user.name}</strong>,</p>
               <p>Te recordamos que tu plan en GYM-UCN vence en <strong>72 horas</strong> (el día <strong>${displayDueDate}</strong>).</p>
               <p>Por favor realiza el pago correspondiente para mantener tu acceso habilitado sin interrupciones.</p>
               <p>Saludos cordiales,<br>El Equipo GYM-UCN</p>`
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        completed++;
        if (!mailErr) {
          sentCount++;
          console.log(`Recordatorio de pago enviado a ${user.email} para la fecha de vencimiento ${displayDueDate}`);
        } else {
          console.error(`Error enviando recordatorio a ${user.email}:`, mailErr);
        }

        if (completed === eligibleUsers.length) {
          if (manualCallback) manualCallback(null, sentCount);
        }
      });
    });
  });
}

// Ejecutar revisión automática cada 24 horas
setInterval(() => {
  console.log("Ejecutando revisión automática de recordatorios de pago...");
  checkAndSendPaymentReminders();
}, 24 * 60 * 60 * 1000);

// Ejecutar revisión automática inicial a los 10 segundos
setTimeout(() => {
  console.log("Ejecutando revisión inicial de recordatorios de pago...");
  checkAndSendPaymentReminders();
}, 10000);


// --- SISTEMA DE NOTIFICACIONES AUTOMÁTICAS POR INACTIVIDAD ---

function getRunFromRut(rut) {
  if (!rut) return '';
  const rutStr = rut.toString();
  const clean = rutStr.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').trim().toUpperCase();
  if (clean.length < 2) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

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

function getUserRegistrationDate(user, habilitaciones = []) {
  if (user.registrationDate) {
    const rawDate = user.registrationDate.toString();
    return new Date(rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T'));
  }
  if (user.rut && habilitaciones && habilitaciones.length > 0) {
    const userRutBody = getRunFromRut(user.rut.toString());
    const hab = habilitaciones.find(h => h.rut && getRunFromRut(h.rut.toString()) === userRutBody);
    if (hab && hab.fecha_registro) {
      const rawDate = hab.fecha_registro.toString();
      return new Date(rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T'));
    }
  }
  if (user.id && user.id.startsWith('user-')) {
    const tsStr = user.id.split('-')[1];
    const ts = parseInt(tsStr);
    if (!isNaN(ts) && ts > 1000000000000) {
      return new Date(ts);
    }
  }
  return new Date(0);
}

function checkAndSendRecoveryNotifications(manualCallback) {
  db.getAllUsers((err, users) => {
    if (err || !users) {
      if (manualCallback) manualCallback(err);
      return;
    }
    
    db.getAllHabilitaciones((err, habilitaciones) => {
      if (err || !habilitaciones) {
        if (manualCallback) manualCallback(err);
        return;
      }
      
      let sentCount = 0;
      let checkedCount = 0;
      
      const highRiskUsers = users.filter(u => u.assignedCluster === 'Alto riesgo');
      if (highRiskUsers.length === 0) {
        if (manualCallback) manualCallback(null, 0);
        return;
      }
      
      highRiskUsers.forEach(user => {
        let isRegisteredCurrentMonth = false;
        if (user.rut && habilitaciones.length > 0) {
          const userRutBody = getRunFromRut(user.rut.toString());
          const hab = habilitaciones.find(h => h.rut && getRunFromRut(h.rut.toString()) === userRutBody);
          if (hab) {
            if (hab.es_exento) {
              isRegisteredCurrentMonth = true;
            } else if (hab.fecha_registro) {
              try {
                const now = new Date();
                const santiagoStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
                const santiagoNow = new Date(santiagoStr);

                const regDateVal = hab.fecha_registro.includes('Z') ? hab.fecha_registro : hab.fecha_registro + 'Z';
                const regDate = new Date(regDateVal);
                const regSantiagoStr = regDate.toLocaleString("en-US", { timeZone: "America/Santiago" });
                const regSantiago = new Date(regSantiagoStr);

                isRegisteredCurrentMonth = regSantiago.getFullYear() === santiagoNow.getFullYear() && 
                                           regSantiago.getMonth() === santiagoNow.getMonth();
              } catch (e) {
                console.error("Error parsing fecha_registro in checkAndSendRecoveryNotifications:", e);
              }
            }
          }
        }
        
        if (!isRegisteredCurrentMonth) {
          checkedCount++;
          if (checkedCount === highRiskUsers.length && manualCallback) {
            manualCallback(null, sentCount);
          }
          return;
        }

        db.getUserAttendanceHistory(user.id, (logsErr, logs) => {
          checkedCount++;
          if (logsErr) {
            console.error(`Error obteniendo logs para usuario ${user.id}:`, logsErr);
            if (checkedCount === highRiskUsers.length && manualCallback) {
              manualCallback(null, sentCount);
            }
            return;
          }
          
          const sortedLogs = logs || [];
          const lastLog = sortedLogs[0];
          
          let rutinaSugerida = "Tren Superior";
          if (lastLog && lastLog.routineName) {
            if (lastLog.routineName.toLowerCase().includes("superior")) {
              rutinaSugerida = "Tren Inferior";
            }
          }
          
          let daysInactive = 0;
          const today = new Date();
          
          if (lastLog && lastLog.date) {
            const diffTime = Math.abs(today - new Date(lastLog.date));
            daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          } else {
            const regDate = getUserRegistrationDate(user, habilitaciones);
            const diffTime = Math.abs(today - regDate);
            daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }
          
          if (daysInactive >= 3) {
            const message = `Notamos que llevas ${daysInactive} días sin entrenar, tu rutina de ${rutinaSugerida} te espera con ajuste de carga de -10%.`;
            
            db.db.get(
              "SELECT COUNT(*) as count FROM notificaciones_web WHERE user_id = ? AND message = ? AND datetime(fecha_hora) > datetime('now', '-1 day')",
              [user.id, message],
              (countErr, row) => {
                if (countErr || (row && row.count > 0)) {
                  if (checkedCount === highRiskUsers.length && manualCallback) {
                    manualCallback(null, sentCount);
                  }
                  return;
                }
                
                db.saveWebNotification(user.id, message, (saveErr, notifId) => {
                  if (saveErr) {
                    console.error("Error guardando notificación automática:", saveErr);
                    if (checkedCount === highRiskUsers.length && manualCallback) {
                      manualCallback(null, sentCount);
                    }
                    return;
                  }
                  
                  if (user.email && transporter) {
                    const mailOptions = {
                      from: '"GYM-UCN Admin" <jacinto.acosta@alumnos.ucn.cl>',
                      to: user.email,
                      subject: 'Alerta de Recuperación Automática - GYM-UCN',
                      text: message,
                      html: `<p>Hola ${user.name},</p><p>${message}</p><p>El Equipo GYM-UCN</p>`
                    };
                    
                    transporter.sendMail(mailOptions, (mailErr, info) => {
                      if (!mailErr) {
                        sentCount++;
                        console.log(`Alerta de recuperación automática enviada a ${user.email} (${daysInactive} días inactivo)`);
                      } else {
                        console.error(`Error enviando email de recuperación automática a ${user.email}:`, mailErr);
                      }
                      
                      if (checkedCount === highRiskUsers.length && manualCallback) {
                        manualCallback(null, sentCount);
                      }
                    });
                  } else {
                    sentCount++;
                    if (checkedCount === highRiskUsers.length && manualCallback) {
                      manualCallback(null, sentCount);
                    }
                  }
                });
              }
            );
          } else {
            if (checkedCount === highRiskUsers.length && manualCallback) {
              manualCallback(null, sentCount);
            }
          }
        });
      });
    });
  });
}

// Programador automático en el Servidor
setInterval(() => {
  console.log("Ejecutando revisión automática de inactividad de atletas...");
  checkAndSendRecoveryNotifications();
}, 24 * 60 * 60 * 1000);

setTimeout(() => {
  console.log("Ejecutando revisión inicial de inactividad de atletas...");
  checkAndSendRecoveryNotifications();
}, 15000);

// Endpoint de Prueba/Acción Manual para Recordatorios de Recuperación por inactividad (Admin Only)
app.post('/api/admin/trigger-recovery-check', authenticateAdmin, (req, res) => {
  checkAndSendRecoveryNotifications((err, sentCount) => {
    if (err) return res.status(500).json({ error: 'Error ejecutando recordatorios de inactividad: ' + err.message });
    res.json({ success: true, message: `Ejecución manual de alertas de inactividad completada. Alertas enviadas: ${sentCount}` });
  });
});

// Endpoint Comunicados: Consultar comunicados dirigidos al tipo de perfil
app.get('/api/comunicados', (req, res) => {
  const { profileType } = req.query;
  db.getComunicados(profileType, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar comunicados.' });
    res.json({ success: true, comunicados: rows || [] });
  });
});

// Endpoint Comunicados: Crear comunicado (Admin Only)
app.post('/api/admin/comunicados', authenticateAdmin, (req, res) => {
  const { title, content, targetGroup } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios.' });
  }
  db.addComunicado({ title, content, targetGroup }, (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar comunicado.' });
    res.json({ success: true, message: 'Comunicado publicado con éxito.' });
  });
});

// Endpoint Rutinas: Crear o actualizar rutina y ejercicios (Admin Only)
app.post('/api/admin/routines', authenticateAdmin, (req, res) => {
  const routineData = req.body;
  if (!routineData || !routineData.id || !routineData.name || !routineData.duration) {
    return res.status(400).json({ error: 'Faltan datos obligatorios de la rutina (id, name, duration).' });
  }
  db.saveRoutine(routineData, (err) => {
    if (err) {
      console.error("Error guardando rutina:", err);
      return res.status(500).json({ error: 'Error al guardar la rutina en la base de datos.' });
    }
    res.json({ success: true, message: 'Rutina guardada y sincronizada correctamente.' });
  });
});

// Endpoint Renovación: Renovar plan mensual +30 días (Admin Only)
app.post('/api/admin/users/renew', authenticateAdmin, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId.' });
  db.renewUserPlan(userId, (err, newDueDateISO) => {
    if (err) {
      console.error("Error al renovar plan:", err);
      return res.status(500).json({ error: 'Error al renovar el plan mensual.' });
    }
    res.json({ 
      success: true, 
      message: 'Plan renovado exitosamente por 30 días.', 
      expirationDate: newDueDateISO.slice(0, 10),
      paymentDueDate: newDueDateISO,
      registrationDate: new Date().toISOString()
    });
  });
});

// Endpoint Actualizar Configuración Administrativa de Usuario: Elite, Fecha Pago, Fecha Vencimiento (Admin Only)
app.post('/api/admin/users/fields', authenticateAdmin, (req, res) => {
  const { userId, isElite, paymentDate, expirationDate, registrationDate, paymentDueDate } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId.' });
  db.updateUserAdminFields(userId, { isElite, paymentDate, expirationDate, registrationDate, paymentDueDate }, (err) => {
    if (err) {
      console.error("Error al actualizar campos de usuario:", err);
      return res.status(500).json({ error: 'Error al actualizar configuración administrativa.' });
    }
    res.json({ success: true, message: 'Configuración administrativa guardada correctamente.' });
  });
});

// Endpoint de Prueba/Acción Manual para Recordatorios de Pago (Admin Only)
app.post('/api/admin/trigger-payment-reminders', authenticateAdmin, (req, res) => {
  checkAndSendPaymentReminders((err, sentCount) => {
    if (err) return res.status(500).json({ error: 'Error ejecutando recordatorios de pago: ' + err.message });
    res.json({ success: true, message: `Ejecución manual de recordatorios completada. Correos enviados: ${sentCount}` });
  });
});

// Helper Promise wrapper for SQLite raw queries in server.js
const queryAll = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Helper to escape values for CSV
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  let str = val.toString();
  str = str.replace(/"/g, '""');
  if (str.includes(';') || str.includes('\n') || str.includes('"')) {
    str = `"${str}"`;
  }
  return str;
};

// Endpoint: Obtener Datos Consolidados de Reporte (Admin Only)
app.get('/api/admin/reports', authenticateAdmin, async (req, res) => {
  try {
    const profileFilter = req.query.profile || 'all';
    const reportType = req.query.reportType || 'general';
    const month = req.query.month;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let dateCondAtt, dateCondAsist, dateCondLogs, dateCondMetrics, dateCondProg;
    let attParams, asistParams, logsParams, metricsParams, progParams;
    let dateStr = '';

    if (startDate && endDate) {
      dateCondAtt = `date BETWEEN ? AND ?`;
      dateCondAsist = `fecha_hora BETWEEN ? AND ?`;
      dateCondLogs = `date BETWEEN ? AND ?`;
      dateCondMetrics = `fecha BETWEEN ? AND ?`;
      dateCondProg = `date BETWEEN ? AND ?`;

      attParams = [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'];
      asistParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      logsParams = [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'];
      metricsParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      progParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      dateStr = `${startDate} a ${endDate}`;
    } else {
      const selectedMonth = month || new Date().toISOString().substring(0, 7);
      const likeParam = `${selectedMonth}%`;
      dateCondAtt = `date LIKE ?`;
      dateCondAsist = `fecha_hora LIKE ?`;
      dateCondLogs = `date LIKE ?`;
      dateCondMetrics = `fecha LIKE ?`;
      dateCondProg = `date LIKE ?`;

      attParams = [likeParam];
      asistParams = [likeParam];
      logsParams = [likeParam];
      metricsParams = [likeParam];
      progParams = [likeParam];
      dateStr = selectedMonth;
    }

    let usersQuery = `SELECT id, name, rut, email, profileType, weight, height, imc, bodyFat, injured, injuryDetails, assignedCluster, (SELECT MAX(date) FROM logs l WHERE l.userId = users.id) as lastWorkoutDate FROM users`;
    const usersParams = [];
    const clauses = [];

    if (profileFilter !== 'all') {
      clauses.push(`profileType = ?`);
      usersParams.push(profileFilter);
    }

    if (reportType === 'kinesiology') {
      clauses.push(`injured = 1`);
    }

    if (clauses.length > 0) {
      usersQuery += ` WHERE ` + clauses.join(' AND ');
    }

    const [users, attendanceRows, qrAttendanceRows, logsRows, metricsRows, progressionRows] = await Promise.all([
      queryAll(usersQuery, usersParams),
      queryAll(`SELECT userId, date FROM attendance WHERE ${dateCondAtt}`, attParams),
      queryAll(`SELECT usuario_id as userId, fecha_hora as date FROM asistencia WHERE ${dateCondAsist}`, asistParams),
      queryAll(`SELECT userId, routineName, date, duration, volume, setsCount FROM logs WHERE ${dateCondLogs}`, logsParams),
      queryAll(`SELECT user_id as userId, weight, height, imc, body_fat as bodyFat, fecha FROM historial_metricas WHERE ${dateCondMetrics} ORDER BY fecha DESC`, metricsParams),
      queryAll(`SELECT user_id as userId, exercise_name as exerciseName, weight, reps, date FROM progresion_atletas WHERE ${dateCondProg} ORDER BY date DESC`, progParams)
    ]);

    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = {
        id: u.id,
        name: u.name,
        rut: u.rut,
        email: u.email,
        profileType: u.profileType,
        injured: u.injured,
        injuryDetails: u.injuryDetails,
        assignedCluster: u.assignedCluster,
        lastWorkoutDate: u.lastWorkoutDate,
        currentMetrics: {
          weight: u.weight,
          height: u.height,
          imc: u.imc,
          bodyFat: u.bodyFat
        },
        monthlyAttendanceCount: 0,
        kinesiologyAttendanceCount: 0,
        lastKinesiologyDate: null,
        attendancesList: [],
        completedRoutines: [],
        completedExercises: {},
        metricsHistory: []
      };
    });

    // Also get ALL kinesiology sessions to count total kine sessions and last date
    const kinesiologyRows = await queryAll(`SELECT userId, date FROM attendance WHERE type = 'kinesiology' ORDER BY date DESC`, []);
    kinesiologyRows.forEach(k => {
      if (usersMap[k.userId]) {
        usersMap[k.userId].kinesiologyAttendanceCount++;
        if (!usersMap[k.userId].lastKinesiologyDate) {
          usersMap[k.userId].lastKinesiologyDate = k.date;
        }
      }
    });

    const incrementAttendance = (userId, date) => {
      if (usersMap[userId]) {
        usersMap[userId].monthlyAttendanceCount++;
        usersMap[userId].attendancesList.push(date);
      }
    };
    attendanceRows.forEach(a => incrementAttendance(a.userId, a.date));
    qrAttendanceRows.forEach(a => incrementAttendance(a.userId, a.date));

    logsRows.forEach(log => {
      if (usersMap[log.userId]) {
        usersMap[log.userId].completedRoutines.push({
          routineName: log.routineName,
          date: log.date,
          duration: log.duration,
          volume: log.volume,
          setsCount: log.setsCount
        });
      }
    });

    progressionRows.forEach(p => {
      if (usersMap[p.userId]) {
        if (!usersMap[p.userId].completedExercises[p.exerciseName]) {
          usersMap[p.userId].completedExercises[p.exerciseName] = {
            exerciseName: p.exerciseName,
            setsCount: 0,
            maxWeight: 0,
            totalVolume: 0
          };
        }
        const exerciseStats = usersMap[p.userId].completedExercises[p.exerciseName];
        exerciseStats.setsCount++;
        if (p.weight > exerciseStats.maxWeight) {
          exerciseStats.maxWeight = p.weight;
        }
        exerciseStats.totalVolume += (p.weight * p.reps);
      }
    });

    metricsRows.forEach(m => {
      if (usersMap[m.userId]) {
        usersMap[m.userId].metricsHistory.push({
          weight: m.weight,
          height: m.height,
          imc: m.imc,
          bodyFat: m.bodyFat,
          date: m.fecha
        });
      }
    });

    Object.values(usersMap).forEach(u => {
      u.completedExercises = Object.values(u.completedExercises);
    });

    let reportData = Object.values(usersMap);

    if (reportType === 'retention') {
      const now = new Date();
      reportData = reportData.filter(u => {
        const lastDate = u.lastWorkoutDate ? new Date(u.lastWorkoutDate) : null;
        const daysInactive = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
        return u.assignedCluster === 'Alto riesgo' || daysInactive > 7;
      });
    }

    res.json({ success: true, month: dateStr, profile: profileFilter, reportType, reportData });
  } catch (err) {
    console.error("Error generating reports data:", err);
    res.status(500).json({ error: 'Error interno al generar reporte: ' + err.message });
  }
});

// Endpoint: Exportar Reporte a PDF (Admin Only)
app.get('/api/admin/reports/export/pdf', authenticateAdmin, async (req, res) => {
  try {
    const profileFilter = req.query.profile || 'all';
    const reportType = req.query.reportType || 'general';
    const month = req.query.month;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let dateCondAtt, dateCondAsist, dateCondLogs, dateCondMetrics;
    let attParams, asistParams, logsParams, metricsParams;
    let dateStr = '';

    if (startDate && endDate) {
      dateCondAtt = `date BETWEEN ? AND ?`;
      dateCondAsist = `fecha_hora BETWEEN ? AND ?`;
      dateCondLogs = `date BETWEEN ? AND ?`;
      dateCondMetrics = `fecha BETWEEN ? AND ?`;

      attParams = [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'];
      asistParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      logsParams = [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'];
      metricsParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      dateStr = `${startDate} a ${endDate}`;
    } else {
      const selectedMonth = month || new Date().toISOString().substring(0, 7);
      const likeParam = `${selectedMonth}%`;
      dateCondAtt = `date LIKE ?`;
      dateCondAsist = `fecha_hora LIKE ?`;
      dateCondLogs = `date LIKE ?`;
      dateCondMetrics = `fecha LIKE ?`;

      attParams = [likeParam];
      asistParams = [likeParam];
      logsParams = [likeParam];
      metricsParams = [likeParam];
      dateStr = selectedMonth;
    }

    let usersQuery = `SELECT id, name, rut, email, profileType, weight, height, imc, bodyFat, injured, injuryDetails, assignedCluster, (SELECT MAX(date) FROM logs l WHERE l.userId = users.id) as lastWorkoutDate FROM users`;
    const usersParams = [];
    const clauses = [];

    if (profileFilter !== 'all') {
      clauses.push(`profileType = ?`);
      usersParams.push(profileFilter);
    }

    if (reportType === 'kinesiology') {
      clauses.push(`injured = 1`);
    }

    if (clauses.length > 0) {
      usersQuery += ` WHERE ` + clauses.join(' AND ');
    }

    const [users, attendanceRows, qrAttendanceRows, logsRows, metricsRows] = await Promise.all([
      queryAll(usersQuery, usersParams),
      queryAll(`SELECT userId, date FROM attendance WHERE ${dateCondAtt}`, attParams),
      queryAll(`SELECT usuario_id as userId, fecha_hora as date FROM asistencia WHERE ${dateCondAsist}`, asistParams),
      queryAll(`SELECT userId, routineName FROM logs WHERE ${dateCondLogs}`, logsParams),
      queryAll(`SELECT user_id as userId, weight, imc, body_fat as bodyFat, fecha FROM historial_metricas WHERE ${dateCondMetrics} ORDER BY fecha DESC`, metricsParams)
    ]);

    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = {
        name: u.name,
        rut: u.rut,
        email: u.email,
        profileType: u.profileType,
        weight: u.weight,
        imc: u.imc,
        bodyFat: u.bodyFat,
        injured: u.injured,
        injuryDetails: u.injuryDetails,
        assignedCluster: u.assignedCluster,
        lastWorkoutDate: u.lastWorkoutDate,
        attendances: 0,
        kinesiologyAttendances: 0,
        lastKinesiologyDate: null,
        routines: [],
        metrics: []
      };
    });

    const incAtt = (id) => { if (usersMap[id]) usersMap[id].attendances++; };
    attendanceRows.forEach(a => incAtt(a.userId));
    qrAttendanceRows.forEach(a => incAtt(a.userId));

    const kinesiologyRows = await queryAll(`SELECT userId, date FROM attendance WHERE type = 'kinesiology' ORDER BY date DESC`, []);
    kinesiologyRows.forEach(k => {
      if (usersMap[k.userId]) {
        usersMap[k.userId].kinesiologyAttendances++;
        if (!usersMap[k.userId].lastKinesiologyDate) {
          usersMap[k.userId].lastKinesiologyDate = k.date;
        }
      }
    });

    logsRows.forEach(l => {
      if (usersMap[l.userId]) usersMap[l.userId].routines.push(l.routineName);
    });

    metricsRows.forEach(m => {
      if (usersMap[m.userId]) {
        usersMap[m.userId].metrics.push(m);
      }
    });

    let reportData = Object.values(usersMap);

    if (reportType === 'retention') {
      const now = new Date();
      reportData = reportData.filter(u => {
        const lastDate = u.lastWorkoutDate ? new Date(u.lastWorkoutDate) : null;
        const daysInactive = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
        return u.assignedCluster === 'Alto riesgo' || daysInactive > 7;
      });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_AURA_${reportType}_${dateStr}.pdf`);
    doc.pipe(res);

    // Page Header
    doc.fillColor('#0f172a').fontSize(20).text('AURA FITNESS', { align: 'center' });
    
    let reportTitle = 'Reporte de Actividad y Progreso Mensual';
    if (reportType === 'retention') reportTitle = 'Reporte de Adherencia y Deserción (Alto Riesgo)';
    if (reportType === 'kinesiology') reportTitle = 'Reporte Consolidado de Kinesiología y Lesiones';

    doc.fontSize(12).fillColor('#475569').text(reportTitle, { align: 'center' });
    doc.moveDown();

    // Meta Info
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    const profileLabelMap = {
      all: 'Todos los perfiles',
      estudiante: 'Estudiantes',
      funcionario: 'Funcionarios',
      deportista_seleccionado: 'Atletas Élite'
    };

    doc.fillColor('#1e293b').fontSize(10);
    doc.text(`Rango/Mes: ${dateStr}`, { continued: true });
    doc.text(` | Perfil: ${profileLabelMap[profileFilter] || profileFilter}`, { align: 'right' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL')}`, { align: 'left' });
    doc.moveDown();

    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown();

    // Table Header depending on reportType
    const drawTableHeader = (yPos) => {
      doc.rect(40, yPos, 515, 20).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(8.5);
      if (reportType === 'retention') {
        doc.text('Atleta / RUT', 45, yPos + 6, { width: 140 });
        doc.text('Correo', 190, yPos + 6, { width: 130 });
        doc.text('Clúster', 330, yPos + 6, { width: 80 });
        doc.text('Último Entreno', 420, yPos + 6, { width: 70 });
        doc.text('Inactivo', 500, yPos + 6, { width: 50, align: 'right' });
      } else if (reportType === 'kinesiology') {
        doc.text('Atleta / RUT', 45, yPos + 6, { width: 130 });
        doc.text('Perfil', 180, yPos + 6, { width: 80 });
        doc.text('Detalle Clínico (Lesión)', 265, yPos + 6, { width: 160 });
        doc.text('Sesiones', 430, yPos + 6, { width: 55, align: 'center' });
        doc.text('Última Sesión', 490, yPos + 6, { width: 60, align: 'right' });
      } else {
        doc.text('Atleta / RUT', 45, yPos + 6, { width: 140 });
        doc.text('Perfil', 190, yPos + 6, { width: 90 });
        doc.text('Asistencias', 285, yPos + 6, { width: 60, align: 'center' });
        doc.text('Rutinas Realizadas', 350, yPos + 6, { width: 100 });
        doc.text('Métricas (Peso / IMC / Grasa)', 455, yPos + 6, { width: 95, align: 'right' });
      }
      return yPos + 20;
    };

    let y = doc.y;
    y = drawTableHeader(y);

    // Draw Rows
    doc.fillColor('#334155');
    reportData.forEach((row, idx) => {
      if (y > 720) {
        doc.addPage();
        y = 40;
        y = drawTableHeader(y);
      }

      if (idx % 2 === 1) {
        doc.rect(40, y, 515, 22).fill('#f8fafc');
      }

      const cleanName = row.name || 'Nuevo Atleta';
      const cleanRut = row.rut || '--';
      const profileLabel = profileLabelMap[row.profileType] || row.profileType || 'Estudiante';

      doc.fillColor('#334155').fontSize(8);

      if (reportType === 'retention') {
        const lastDateStr = row.lastWorkoutDate ? row.lastWorkoutDate.slice(0, 10) : 'Nunca';
        const lastDate = row.lastWorkoutDate ? new Date(row.lastWorkoutDate) : null;
        const daysInactive = lastDate ? Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24)) : 999;
        const daysInactiveStr = daysInactive === 999 ? 'N/A' : `${daysInactive} días`;

        doc.text(`${cleanName}\n${cleanRut}`, 45, y + 4, { width: 140 });
        doc.text(row.email || '--', 190, y + 6, { width: 130 });
        doc.text(row.assignedCluster || 'Pendiente', 330, y + 6, { width: 80 });
        doc.text(lastDateStr, 420, y + 6, { width: 70 });
        doc.text(daysInactiveStr, 500, y + 6, { width: 50, align: 'right' });

      } else if (reportType === 'kinesiology') {
        const lastKine = row.lastKinesiologyDate ? row.lastKinesiologyDate.slice(0, 10) : 'Nunca';
        const kineSessions = row.kinesiologyAttendances.toString();

        doc.text(`${cleanName}\n${cleanRut}`, 45, y + 4, { width: 130 });
        doc.text(profileLabel, 180, y + 6, { width: 80 });
        doc.text(row.injuryDetails || 'Sin detalles clínicos registrados', 265, y + 6, { width: 160 });
        doc.text(kineSessions, 430, y + 6, { width: 55, align: 'center' });
        doc.text(lastKine, 490, y + 6, { width: 60, align: 'right' });

      } else {
        const attCount = row.attendances.toString();
        const uniqueRoutines = Array.from(new Set(row.routines));
        const routinesStr = uniqueRoutines.length > 0 ? uniqueRoutines.slice(0, 2).join(', ') + (uniqueRoutines.length > 2 ? '...' : '') : 'Ninguna';

        let metricsStr = '--';
        if (row.metrics && row.metrics.length > 0) {
          const latest = row.metrics[0];
          metricsStr = `${latest.weight || 0}kg / ${latest.imc || 0} / ${latest.bodyFat || 0}%`;
        } else if (row.weight) {
          metricsStr = `${row.weight || 0}kg / ${row.imc || 0} / ${row.bodyFat || 0}%`;
        }

        doc.text(`${cleanName}\n${cleanRut}`, 45, y + 4, { width: 140 });
        doc.text(profileLabel, 190, y + 6, { width: 90 });
        doc.text(attCount, 285, y + 6, { width: 60, align: 'center' });
        doc.text(routinesStr, 350, y + 6, { width: 100 });
        doc.text(metricsStr, 455, y + 6, { width: 95, align: 'right' });
      }

      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(40, y + 22).lineTo(555, y + 22).stroke();
      y += 22;
    });

    doc.end();
  } catch (err) {
    console.error("Error generating PDF report:", err);
    res.status(500).json({ error: 'Error al generar el PDF de reportes: ' + err.message });
  }
});

// Endpoint: Exportar Reporte a Excel/CSV (Admin Only)
app.get('/api/admin/reports/export/excel', authenticateAdmin, async (req, res) => {
  try {
    const profileFilter = req.query.profile || 'all';
    const reportType = req.query.reportType || 'general';
    const month = req.query.month;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let dateCondAtt, dateCondAsist, dateCondLogs, dateCondMetrics;
    let attParams, asistParams, logsParams, metricsParams;
    let dateStr = '';

    if (startDate && endDate) {
      dateCondAtt = `date BETWEEN ? AND ?`;
      dateCondAsist = `fecha_hora BETWEEN ? AND ?`;
      dateCondLogs = `date BETWEEN ? AND ?`;
      dateCondMetrics = `fecha BETWEEN ? AND ?`;

      attParams = [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'];
      asistParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      logsParams = [startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'];
      metricsParams = [startDate + ' 00:00:00', endDate + ' 23:59:59'];
      dateStr = `${startDate} a ${endDate}`;
    } else {
      const selectedMonth = month || new Date().toISOString().substring(0, 7);
      const likeParam = `${selectedMonth}%`;
      dateCondAtt = `date LIKE ?`;
      dateCondAsist = `fecha_hora LIKE ?`;
      dateCondLogs = `date LIKE ?`;
      dateCondMetrics = `fecha LIKE ?`;

      attParams = [likeParam];
      asistParams = [likeParam];
      logsParams = [likeParam];
      metricsParams = [likeParam];
      dateStr = selectedMonth;
    }

    let usersQuery = `SELECT id, name, rut, email, profileType, weight, height, imc, bodyFat, injured, injuryDetails, assignedCluster, (SELECT MAX(date) FROM logs l WHERE l.userId = users.id) as lastWorkoutDate FROM users`;
    const usersParams = [];
    const clauses = [];

    if (profileFilter !== 'all') {
      clauses.push(`profileType = ?`);
      usersParams.push(profileFilter);
    }

    if (reportType === 'kinesiology') {
      clauses.push(`injured = 1`);
    }

    if (clauses.length > 0) {
      usersQuery += ` WHERE ` + clauses.join(' AND ');
    }

    const [users, attendanceRows, qrAttendanceRows, logsRows, metricsRows] = await Promise.all([
      queryAll(usersQuery, usersParams),
      queryAll(`SELECT userId, date FROM attendance WHERE ${dateCondAtt}`, attParams),
      queryAll(`SELECT usuario_id as userId, fecha_hora as date FROM asistencia WHERE ${dateCondAsist}`, asistParams),
      queryAll(`SELECT userId, routineName, volume FROM logs WHERE ${dateCondLogs}`, logsParams),
      queryAll(`SELECT user_id as userId, weight, imc, body_fat as bodyFat, fecha FROM historial_metricas WHERE ${dateCondMetrics} ORDER BY fecha DESC`, metricsParams)
    ]);

    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = {
        name: u.name,
        rut: u.rut,
        email: u.email,
        profileType: u.profileType,
        weight: u.weight,
        imc: u.imc,
        bodyFat: u.bodyFat,
        injured: u.injured,
        injuryDetails: u.injuryDetails,
        assignedCluster: u.assignedCluster,
        lastWorkoutDate: u.lastWorkoutDate,
        attendances: 0,
        kinesiologyAttendances: 0,
        lastKinesiologyDate: null,
        routines: [],
        totalVolume: 0,
        metrics: []
      };
    });

    const incAtt = (id) => { if (usersMap[id]) usersMap[id].attendances++; };
    attendanceRows.forEach(a => incAtt(a.userId));
    qrAttendanceRows.forEach(a => incAtt(a.userId));

    const kinesiologyRows = await queryAll(`SELECT userId, date FROM attendance WHERE type = 'kinesiology' ORDER BY date DESC`, []);
    kinesiologyRows.forEach(k => {
      if (usersMap[k.userId]) {
        usersMap[k.userId].kinesiologyAttendances++;
        if (!usersMap[k.userId].lastKinesiologyDate) {
          usersMap[k.userId].lastKinesiologyDate = k.date;
        }
      }
    });

    logsRows.forEach(l => {
      if (usersMap[l.userId]) {
        usersMap[l.userId].routines.push(l.routineName);
        usersMap[l.userId].totalVolume += (l.volume || 0);
      }
    });

    metricsRows.forEach(m => {
      if (usersMap[m.userId]) {
        usersMap[m.userId].metrics.push(m);
      }
    });

    let reportData = Object.values(usersMap);

    if (reportType === 'retention') {
      const now = new Date();
      reportData = reportData.filter(u => {
        const lastDate = u.lastWorkoutDate ? new Date(u.lastWorkoutDate) : null;
        const daysInactive = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
        return u.assignedCluster === 'Alto riesgo' || daysInactive > 7;
      });
    }

    const profileLabelMap = {
      all: 'Todos los perfiles',
      estudiante: 'Estudiante',
      funcionario: 'Funcionario',
      deportista_seleccionado: 'Atleta Élite'
    };

    let csvContent = '\uFEFF'; // UTF-8 BOM
    
    if (reportType === 'retention') {
      csvContent += 'RUT;Nombre;Correo;Perfil;Cluster;Ultimo Entrenamiento;Dias Inactivo\n';
      reportData.forEach(row => {
        const lastDateStr = row.lastWorkoutDate ? row.lastWorkoutDate.slice(0, 10) : 'Nunca';
        const lastDate = row.lastWorkoutDate ? new Date(row.lastWorkoutDate) : null;
        const daysInactive = lastDate ? Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24)) : 999;
        const daysInactiveStr = daysInactive === 999 ? 'N/A' : `${daysInactive}`;

        const line = [
          escapeCSV(row.rut),
          escapeCSV(row.name),
          escapeCSV(row.email),
          escapeCSV(profileLabelMap[row.profileType] || row.profileType || 'Estudiante'),
          escapeCSV(row.assignedCluster || 'Pendiente'),
          escapeCSV(lastDateStr),
          escapeCSV(daysInactiveStr)
        ];
        csvContent += line.join(';') + '\n';
      });
    } else if (reportType === 'kinesiology') {
      csvContent += 'RUT;Nombre;Correo;Perfil;Detalle Clinico;Total Sesiones Kinesiologia;Ultima Sesion\n';
      reportData.forEach(row => {
        const lastKineStr = row.lastKinesiologyDate ? row.lastKinesiologyDate.slice(0, 10) : 'Nunca';
        const line = [
          escapeCSV(row.rut),
          escapeCSV(row.name),
          escapeCSV(row.email),
          escapeCSV(profileLabelMap[row.profileType] || row.profileType || 'Estudiante'),
          escapeCSV(row.injuryDetails || 'Sin detalles'),
          row.kinesiologyAttendances,
          escapeCSV(lastKineStr)
        ];
        csvContent += line.join(';') + '\n';
      });
    } else {
      csvContent += 'RUT;Nombre;Correo;Perfil;Asistencias en el Periodo;Rutinas Completadas;Volumen Total Entrenado (kg);Peso Registrado (kg);IMC;Grasa Corporal (%)\n';
      reportData.forEach(row => {
        const uRoutines = Array.from(new Set(row.routines));
        const routinesStr = uRoutines.join(', ') || 'Ninguna';

        let latestWeight = row.weight || 0;
        let latestImc = row.imc || 0;
        let latestBodyFat = row.bodyFat || 0;
        if (row.metrics && row.metrics.length > 0) {
          latestWeight = row.metrics[0].weight || latestWeight;
          latestImc = row.metrics[0].imc || latestImc;
          latestBodyFat = row.metrics[0].bodyFat || latestBodyFat;
        }

        const line = [
          escapeCSV(row.rut),
          escapeCSV(row.name),
          escapeCSV(row.email),
          escapeCSV(profileLabelMap[row.profileType] || row.profileType || 'Estudiante'),
          row.attendances,
          escapeCSV(routinesStr),
          row.totalVolume.toFixed(1),
          latestWeight,
          latestImc,
          latestBodyFat
        ];
        csvContent += line.join(';') + '\n';
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_AURA_${reportType}_${dateStr}.csv`);
    res.send(csvContent);
  } catch (err) {
    console.error("Error exporting Excel/CSV report:", err);
    res.status(500).json({ error: 'Error al generar la planilla Excel/CSV: ' + err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nube AURA corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos administrable en: http://localhost:${PORT}/api/admin/download-db?secret=admin123`);
});
