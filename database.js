const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'aura_database.sqlite');
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // Tabla Users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER,
        sex TEXT,
        weight REAL,
        height REAL,
        goal TEXT,
        level TEXT,
        streak INTEGER,
        assignedCluster TEXT,
        profileType TEXT DEFAULT 'estudiante',
        muscleMass REAL DEFAULT 0.0,
        skeletalMuscle REAL DEFAULT 0.0,
        injured INTEGER DEFAULT 0,
        injuryDetails TEXT DEFAULT '',
        rut TEXT,
        email TEXT,
        imc REAL DEFAULT 0.0,
        bodyFat REAL DEFAULT 0.0,
        waist REAL DEFAULT 0.0,
        neck REAL DEFAULT 0.0,
        hip REAL DEFAULT 0.0,
        days TEXT DEFAULT '[]',
        password_hash TEXT,
        isElite INTEGER DEFAULT 0,
        paymentDate TEXT,
        expirationDate TEXT,
        registrationDate TEXT,
        paymentDueDate TEXT
      )
    `);

    // Migraciones rápidas para bases de datos existentes
    db.run("ALTER TABLE users ADD COLUMN profileType TEXT DEFAULT 'estudiante'", () => {});
    db.run("ALTER TABLE users ADD COLUMN muscleMass REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN skeletalMuscle REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN injured INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE users ADD COLUMN injuryDetails TEXT DEFAULT ''", () => {});
    db.run("ALTER TABLE users ADD COLUMN rut TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN email TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN imc REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN bodyFat REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN waist REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN neck REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN hip REAL DEFAULT 0.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN days TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE users ADD COLUMN password_hash TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN isElite INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE users ADD COLUMN paymentDate TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN expirationDate TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN registrationDate TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN paymentDueDate TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN phone TEXT", () => {});
    db.run("ALTER TABLE usuarios_habilitados ADD COLUMN limite_semanal INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE usuarios_habilitados ADD COLUMN email TEXT", () => {});
    db.run("ALTER TABLE usuarios_habilitados ADD COLUMN profileType TEXT DEFAULT 'estudiante'", () => {
      // Migración de datos: Si es_exento es 1, actualizar a deportista_seleccionado
      db.run("UPDATE usuarios_habilitados SET profileType = 'deportista_seleccionado' WHERE es_exento = 1", () => {});
    });

    // Tabla de Usuarios Habilitados
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios_habilitados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rut TEXT UNIQUE NOT NULL,
        dias_permitidos INTEGER DEFAULT 0,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        es_exento BOOLEAN DEFAULT 0,
        limite_semanal INTEGER DEFAULT 0,
        email TEXT,
        profileType TEXT DEFAULT 'estudiante'
      )
    `);

    // Tabla de Administradores
    db.run(`
      CREATE TABLE IF NOT EXISTS administradores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )
    `);

    // Tabla de Progresión de Atletas
    db.run(`
      CREATE TABLE IF NOT EXISTS progresion_atletas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        exercise_name TEXT,
        weight REAL,
        reps INTEGER,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Historial de Métricas Corporales
    db.run(`
      CREATE TABLE IF NOT EXISTS historial_metricas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        weight REAL,
        height REAL,
        muscle_mass REAL,
        skeletal_muscle REAL,
        imc REAL,
        body_fat REAL,
        waist REAL,
        neck REAL,
        hip REAL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabla de Notificaciones Web
    db.run(`
      CREATE TABLE IF NOT EXISTS notificaciones_web (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Comunicados (Mensajes globales o dirigidos)
    db.run(`
      CREATE TABLE IF NOT EXISTS comunicados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        targetGroup TEXT DEFAULT 'all',
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Códigos de Recuperación de Contraseña
    db.run(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);

    // Tabla Workouts / Logs
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        userId TEXT,
        date TEXT,
        routineName TEXT,
        duration TEXT,
        volume REAL,
        setsCount INTEGER,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Tabla de Asistencia
    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        userId TEXT,
        date TEXT,
        type TEXT,
        notes TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Tabla de Asistencia (QR Dinámico)
    db.run(`
      CREATE TABLE IF NOT EXISTS asistencia (
        id TEXT PRIMARY KEY,
        usuario_id TEXT,
        fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES users(id)
      )
    `);

    // Tabla de Máquinas
    db.run(`
      CREATE TABLE IF NOT EXISTS maquinas (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        ubicacion_o_zona TEXT
      )
    `);

    // Tabla de Ejercicios
    db.run(`
      CREATE TABLE IF NOT EXISTS ejercicios (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        muscle TEXT,
        animationClass TEXT,
        videoUrl TEXT,
        instructions TEXT,
        sets TEXT,
        maquina_id TEXT,
        FOREIGN KEY (maquina_id) REFERENCES maquinas(id)
      )
    `);

    // Tabla de Rutinas
    db.run(`
      CREATE TABLE IF NOT EXISTS rutinas (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        duration TEXT
      )
    `);

    // Tabla intermedia Rutinas - Ejercicios (Muchos a Muchos)
    db.run(`
      CREATE TABLE IF NOT EXISTS rutinas_ejercicios (
        rutina_id TEXT,
        ejercicio_id TEXT,
        orden INTEGER,
        PRIMARY KEY (rutina_id, ejercicio_id),
        FOREIGN KEY (rutina_id) REFERENCES rutinas(id),
        FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
      )
    `, () => {
      seedDatabaseIfNeeded();
    });

      console.log('Base de datos inicializada correctamente.');

      // Crear usuario administrador por defecto si no existe
      db.get("SELECT * FROM administradores WHERE username = 'admin'", async (err, row) => {
        if (!row) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash('admin123', salt);
          db.run("INSERT INTO administradores (username, password_hash) VALUES (?, ?)", ['admin', hash], (err) => {
            if (!err) console.log("Usuario administrador por defecto creado (admin:admin123).");
            migrateAndNormalizeRuts();
          });
        } else {
          migrateAndNormalizeRuts();
        }
      });
    });
}

function seedDatabaseIfNeeded() {
  db.get("SELECT COUNT(*) as count FROM rutinas", (err, row) => {
    if (err) {
      console.error("Error al contar rutinas:", err);
      return;
    }
    if (row && row.count > 0) {
      return;
    }

    console.log("Sembrando base de datos con rutinas, ejercicios y máquinas...");

    const maquinas = [
      { id: 'maq-esterilla', nombre: 'Esterilla de Core', descripcion: 'Colchoneta acolchada para trabajo de suelo y core', ubicacion_o_zona: 'Zona de Core & Estiramientos' },
      { id: 'maq-bandas', nombre: 'Estación de Bandas', descripcion: 'Banda elástica de resistencia variable con anclajes', ubicacion_o_zona: 'Zona Funcional' },
      { id: 'maq-silla', nombre: 'Silla / Banco Fijo', descripcion: 'Banco de apoyo estable o silla para fondos e inclinaciones', ubicacion_o_zona: 'Zona de Peso Libre' },
      { id: 'maq-libre', nombre: 'Peso Corporal', descripcion: 'Ejercicios calisténicos o de movilidad que no requieren máquinas fijas', ubicacion_o_zona: 'Espacio Abierto' }
    ];

    const rutinas = [
      { id: 'upper', nombre: 'Tren Superior Élite', duration: '30 min' },
      { id: 'lower', nombre: 'Tren Inferior Potencia', duration: '30 min' },
      { id: 'core', nombre: 'Abdominales Esculpidos', duration: '15 min' },
      { id: 'upper_selected', nombre: 'Tren Superior Selección (Potencia)', duration: '35 min' },
      { id: 'lower_selected', nombre: 'Tren Inferior Selección (Reactivo)', duration: '35 min' },
      { id: 'core_selected', nombre: 'Core Selección (Estabilidad)', duration: '20 min' }
    ];

    const ejercicios = [
      // Upper Routine
      {
        id: 'ex-mov-torso',
        nombre: 'Movilidad Articular Torso',
        muscle: 'Hombros (Movilidad)',
        animationClass: 'mobility-animation',
        videoUrl: 'https://www.youtube.com/embed/FD31v3S23-s',
        instructions: JSON.stringify([
          'Párate con pies firmes y realiza rotaciones lentas de hombros.',
          'Lleva tus brazos estirados hacia los lados dibujando círculos pequeños.',
          'Abre el pecho estirando una banda elástica de baja resistencia frente a ti (Fila 2, Columna 1-2).'
        ]),
        sets: JSON.stringify([
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-flex-estandar',
        nombre: 'Flexiones de Brazos Estándar',
        muscle: 'Pecho (Chest)',
        animationClass: 'pushup-animation',
        videoUrl: 'https://www.youtube.com/embed/4y0i5Kz0qf4',
        instructions: JSON.stringify([
          'Coloca las manos en el suelo, separadas un poco más que el ancho de hombros (Imagen 2).',
          'Cuerpo alineado en línea recta desde los hombros hasta los talones.',
          'Fase Excéntrica: Baja el pecho doblando los codos hacia atrás en ángulo de 45 grados (3 seg).',
          'Fase Concéntrica: Empuja con fuerza contrayendo el pecho hasta extender los brazos (1 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 8, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-flex-inclinadas',
        nombre: 'Flexiones Inclinadas en Silla',
        muscle: 'Pecho (Chest)',
        animationClass: 'pushup-animation',
        videoUrl: 'https://www.youtube.com/embed/6B928R2g060',
        instructions: JSON.stringify([
          'Apoya las manos firmemente en el borde de una silla o banco estable (Imagen 2 - Variante).',
          'Step back para alinear el torso y las piernas formando una pendiente diagonal.',
          'Fase Excéntrica: Baja el torso controladamente hasta rozar la silla con el esternón (3 seg).',
          'Fase Concéntrica: Empuja con fuerza enfocando el esfuerzo en la zona inferior del pectoral (1 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-silla'
      },
      {
        id: 'ex-apertura-pecho',
        nombre: 'Apertura de Pecho con Banda',
        muscle: 'Pecho (Chest)',
        animationClass: 'press-animation',
        videoUrl: 'https://www.youtube.com/embed/cM8lB46b3J0',
        instructions: JSON.stringify([
          'Ancla la banda detrás de tu espalda a la altura de las escápulas (Imagen 3 - Fila 5, Columna 2).',
          'Extiende los brazos hacia adelante manteniendo una ligera flexión en los codos.',
          'Junta las manos al frente de tu cuerpo contrayendo el pecho en la parte concéntrica.',
          'Regresa de forma lenta y controlada abriendo los brazos (3 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-press-hombros-banda',
        nombre: 'Press de Hombros Sentado con Banda',
        muscle: 'Hombros (Shoulders)',
        animationClass: 'press-animation',
        videoUrl: 'https://www.youtube.com/embed/_yC_1gP3nO4',
        instructions: JSON.stringify([
          'Siéntate erguido sobre una silla pisando la banda elástica (Imagen 3 - Fila 5, Columna 3).',
          'Sostén los agarres a la altura de tus orejas con las palmas hacia adelante.',
          'Fase Concéntrica: Empuja la banda hacia arriba sobre tu cabeza hasta estirar los brazos (1 seg).',
          'Fase Excéntrica: Baja la banda lentamente resistiendo la tensión hasta la barbilla (2.5 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-elevaciones-laterales',
        nombre: 'Elevaciones Laterales con Banda',
        muscle: 'Hombros (Shoulders)',
        animationClass: 'press-animation',
        videoUrl: 'https://www.youtube.com/embed/g62x_tW4q-E',
        instructions: JSON.stringify([
          'De pie, pisa el centro de la banda con un pie (Imagen 3 - Fila 4, Columna 2).',
          'Sujeta los extremos de la banda con los brazos extendidos a los costados.',
          'Fase Concéntrica: Eleva los brazos lateralmente hasta la altura de los hombros (1 seg).',
          'Fase Excéntrica: Baja los brazos lentamente controlando la tensión (2.5 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-fondos-dips',
        nombre: 'Fondos en Silla (Dips)',
        muscle: 'Hombros (Shoulders)',
        animationClass: 'dips-animation',
        videoUrl: 'https://www.youtube.com/embed/642-qS9q_tU',
        instructions: JSON.stringify([
          'Apoya las palmas en el borde del banco, pies al frente (Imagen 2 - Fondos/Dips).',
          'Desciende la cadera de forma vertical doblando los codos.',
          'Mantén la espalda pegada al banco.',
          'Empuja de vuelta extendiendo los brazos con la fuerza del tríceps y deltoide anterior.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-silla'
      },
      // Lower Routine
      {
        id: 'ex-mov-cadera',
        nombre: 'Movilidad Cadera y Tobillo',
        muscle: 'Piernas (Movilidad)',
        animationClass: 'mobility-animation',
        videoUrl: 'https://www.youtube.com/embed/Aq_Ohf4MhNU',
        instructions: JSON.stringify([
          'Realiza sentadillas profundas sin carga sujetándote de un soporte (Imagen 4).',
          'Haz estocadas laterales alternas lentas para activar aductores (Fila 3, Columna 1).',
          'Realiza flexiones y giros dinámicos de tobillo de pie.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-sentadilla-bodyweight',
        nombre: 'Sentadilla Peso Corporal',
        muscle: 'Piernas (Cuádriceps/Glúteos)',
        animationClass: 'squat-animation',
        videoUrl: 'https://www.youtube.com/embed/W7oK3saC52g',
        instructions: JSON.stringify([
          'Pies al ancho de hombros, puntas ligeramente hacia afuera (Imagen 2).',
          'Fase Excéntrica: Baja la cadera empujándola hacia atrás como sentándote (3 seg).',
          'Mantén la rodilla alineada en la dirección del pie sin colapsar.',
          'Fase Concéntrica: Empuja con fuerza desde los talones para recuperar la verticalidad (1 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-estocadas-lunges',
        nombre: 'Estocadas Alternadas (Lunges)',
        muscle: 'Piernas (Cuádriceps/Glúteos)',
        animationClass: 'lunges-animation',
        videoUrl: 'https://www.youtube.com/embed/Ry-wqegeKlE',
        instructions: JSON.stringify([
          'Da un paso largo hacia adelante manteniendo la espalda recta (Imagen 2).',
          'Fase Excéntrica: Desciende ambas rodillas hasta que la trasera roce el suelo.',
          'La rodilla delantera debe formar un ángulo de 90 grados y estar alineada con el pie.',
          'Fase Concéntrica: Empuja fuerte con la pierna delantera para regresar (1 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-puente-gluteos-banda',
        nombre: 'Puente de Glúteos con Banda',
        muscle: 'Piernas (Cuádriceps/Glúteos)',
        animationClass: 'bridge-animation',
        videoUrl: 'https://www.youtube.com/embed/7uS-f49R71M',
        instructions: JSON.stringify([
          'Acuéstate boca arriba, rodillas dobladas, pies apoyados en el suelo (Imagen 5 - Fila 1, Columna 3).',
          'Coloca una banda elástica arriba de tus rodillas.',
          'Fase Concéntrica: Eleva la pelvis apretando los glúteos y empujando las rodillas hacia afuera.',
          'Fase Excéntrica: Baja la pelvis lentamente sin apoyar completamente los glúteos (2.5 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 15, weight: 0 },
          { reps: 15, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      // Core Routine
      {
        id: 'ex-crunch-abdominal',
        nombre: 'Crunch Abdominal',
        muscle: 'Abdomen (Core)',
        animationClass: 'crunch-animation',
        videoUrl: 'https://www.youtube.com/embed/X-M8Ww6H0y4',
        instructions: JSON.stringify([
          'Boca arriba, rodillas flexionadas y pies planos (Imagen 2).',
          'Cruza las manos al pecho o apóyalas suavemente en las sienes.',
          'Fase Concéntrica: Eleva los hombros y escápulas contrayendo el abdomen al exhalar.',
          'Mantén la zona lumbar apoyada firmemente en el suelo.'
        ]),
        sets: JSON.stringify([
          { reps: 20, weight: 0 },
          { reps: 15, weight: 0 },
          { reps: 15, weight: 0 }
        ]),
        maquina_id: 'maq-esterilla'
      },
      {
        id: 'ex-elevacion-piernas',
        nombre: 'Elevación de Piernas en Suelo',
        muscle: 'Abdomen (Core)',
        animationClass: 'leg-raises-animation',
        videoUrl: 'https://www.youtube.com/embed/fE9f_3R_a1E',
        instructions: JSON.stringify([
          'Boca arriba en el suelo, con las manos debajo de los glúteos para soporte lumbar (Imagen 5 - Fila 5, Columna 1).',
          'Mantén las piernas rectas juntas.',
          'Fase Concéntrica: Eleva las piernas verticalmente hasta formar un ángulo de 90 grados.',
          'Fase Excéntrica: Baja las piernas de forma controlada hasta que estén cerca del suelo (3 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-esterilla'
      },
      {
        id: 'ex-plancha-estatica',
        nombre: 'Plancha Abdominal Estática (Plank)',
        muscle: 'Abdomen (Core)',
        animationClass: 'plank-animation',
        videoUrl: 'https://www.youtube.com/embed/p1L6oW3d7b8',
        instructions: JSON.stringify([
          'Apoya los antebrazos y las puntas de los pies en el suelo (Imagen 5 - Fila 1, Columna 1).',
          'Los codos deben quedar alineados directamente debajo de los hombros.',
          'Mantén el abdomen y glúteos fuertemente contraídos, cuerpo en línea recta.',
          'Sostén la posición de forma inmóvil respirando controladamente.'
        ]),
        sets: JSON.stringify([
          { reps: 30, weight: 0 },
          { reps: 30, weight: 0 },
          { reps: 30, weight: 0 }
        ]),
        maquina_id: 'maq-esterilla'
      },
      // Upper Selected Routine
      {
        id: 'ex-mov-torso-sel',
        nombre: 'Movilidad Articular Torso Selección',
        muscle: 'Hombros (Movilidad)',
        animationClass: 'mobility-animation',
        videoUrl: 'https://www.youtube.com/embed/FD31v3S23-s',
        instructions: JSON.stringify([
          'Realiza rotaciones dinámicas amplias de hombros y escápulas.',
          'Haz estiramientos dinámicos de pectorales y rotadores con banda elástica.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-flex-explosivas',
        nombre: 'Flexiones de Brazos Explosivas',
        muscle: 'Pecho (Potencia)',
        animationClass: 'pushup-animation',
        videoUrl: 'https://www.youtube.com/embed/4y0i5Kz0qf4',
        instructions: JSON.stringify([
          'Coloca las manos en el suelo. Cuerpo alineado.',
          'Fase Excéntrica: Baja el pecho de forma controlada (2 seg).',
          'Fase Concéntrica: Empuja explosivamente despegando las manos del suelo (palmada si es posible).'
        ]),
        sets: JSON.stringify([
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 8, weight: 0 },
          { reps: 8, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-press-militar-banda',
        nombre: 'Press Militar de Pie con Banda',
        muscle: 'Hombros (Shoulders)',
        animationClass: 'press-animation',
        videoUrl: 'https://www.youtube.com/embed/_yC_1gP3nO4',
        instructions: JSON.stringify([
          'Pisa la banda elástica con ambos pies y sujeta los extremos a la altura de los hombros.',
          'Empuja de forma vertical explosiva extendiendo los brazos totalmente sobre la cabeza.',
          'Desciende de forma controlada resistiendo la tensión elástica (3 seg).'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-apertura-doble-banda',
        nombre: 'Apertura de Pecho Doble Banda',
        muscle: 'Pecho (Chest)',
        animationClass: 'press-animation',
        videoUrl: 'https://www.youtube.com/embed/cM8lB46b3J0',
        instructions: JSON.stringify([
          'Ancla la banda doble y colócate de espaldas.',
          'Abre los brazos y junta las manos al frente con máxima contracción pectoral.',
          'Fase excéntrica lenta resistiendo la tensión del elástico.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-bandas'
      },
      {
        id: 'ex-fondos-dips-explosivos',
        nombre: 'Fondos en Silla Explosivos',
        muscle: 'Tríceps / Hombros',
        animationClass: 'dips-animation',
        videoUrl: 'https://www.youtube.com/embed/642-qS9q_tU',
        instructions: JSON.stringify([
          'Coloca manos en el borde de la silla. Piernas estiradas para mayor palanca.',
          'Baja la cadera verticalmente doblando codos.',
          'Empuja con máxima potencia de tríceps recuperando la posición de bloqueo.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-silla'
      },
      // Lower Selected Routine
      {
        id: 'ex-mov-cadera-din',
        nombre: 'Movilidad Cadera y Tobillo Dinámica',
        muscle: 'Piernas (Movilidad)',
        animationClass: 'mobility-animation',
        videoUrl: 'https://www.youtube.com/embed/Aq_Ohf4MhNU',
        instructions: JSON.stringify([
          'Realiza sentadillas profundas manteniendo talones apoyados.',
          'Ejecuta zancadas laterales y giros de tobillo para activar articulaciones.'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 15, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-sentadilla-salto-plio',
        nombre: 'Sentadilla con Salto Pliométrica',
        muscle: 'Piernas (Fuerza Reactiva)',
        animationClass: 'squat-animation',
        videoUrl: 'https://www.youtube.com/embed/W7oK3saC52g',
        instructions: JSON.stringify([
          'Realiza una sentadilla profunda cargando los talones.',
          'Empuja fuertemente y realiza un salto vertical buscando máxima altura.',
          'Amortigua la caída flexionando rodillas para iniciar el siguiente salto.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-estocadas-plio-alt',
        nombre: 'Estocadas Pliométricas Alternadas',
        muscle: 'Piernas (Fuerza Explosiva)',
        animationClass: 'lunges-animation',
        videoUrl: 'https://www.youtube.com/embed/Ry-wqegeKlE',
        instructions: JSON.stringify([
          'Inicia en posición de estocada. Salta explosivamente hacia arriba.',
          'En el aire, alterna la posición de las piernas.',
          'Cae amortiguando en posición de estocada con la pierna contraria al frente.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 10, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      {
        id: 'ex-puente-gluteos-uni',
        nombre: 'Puente de Glúteos Unilateral',
        muscle: 'Glúteos / Femorales',
        animationClass: 'bridge-animation',
        videoUrl: 'https://www.youtube.com/embed/7uS-f49R71M',
        instructions: JSON.stringify([
          'Acuéstate boca arriba, dobla una rodilla apoyando el pie. Eleva la otra pierna.',
          'Eleva la pelvis contrayendo glúteos de forma explosiva.',
          'Regresa de forma controlada sin apoyar los glúteos en el suelo.'
        ]),
        sets: JSON.stringify([
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-libre'
      },
      // Core Selected Routine
      {
        id: 'ex-plancha-toque-hombros',
        nombre: 'Plancha con Toque de Hombros',
        muscle: 'Abdomen (Core)',
        animationClass: 'plank-animation',
        videoUrl: 'https://www.youtube.com/embed/p1L6oW3d7b8',
        instructions: JSON.stringify([
          'Colócate en posición de plancha alta con manos alineadas.',
          'Toca el hombro izquierdo con la mano derecha, y viceversa, alternadamente.',
          'Evita balancear la cadera manteniendo el abdomen fuertemente contraído.'
        ]),
        sets: JSON.stringify([
          { reps: 20, weight: 0 },
          { reps: 20, weight: 0 },
          { reps: 20, weight: 0 }
        ]),
        maquina_id: 'maq-esterilla'
      },
      {
        id: 'ex-elevacion-rodillas-pecho',
        nombre: 'Elevación de Piernas al Pecho',
        muscle: 'Abdomen (Core)',
        animationClass: 'leg-raises-animation',
        videoUrl: 'https://www.youtube.com/embed/fE9f_3R_a1E',
        instructions: JSON.stringify([
          'Boca arriba, eleva las rodillas hacia el pecho de forma explosiva.',
          'Regresa al inicio extendiendo las piernas de forma lenta y controlada.'
        ]),
        sets: JSON.stringify([
          { reps: 15, weight: 0 },
          { reps: 12, weight: 0 },
          { reps: 12, weight: 0 }
        ]),
        maquina_id: 'maq-esterilla'
      },
      {
        id: 'ex-giros-rusos-tension',
        nombre: 'Giros Rusos con Tensión',
        muscle: 'Abdomen / Oblicuos',
        animationClass: 'russian-twists-animation',
        videoUrl: 'https://www.youtube.com/embed/X-M8Ww6H0y4',
        instructions: JSON.stringify([
          'Siéntate inclinando el torso atrás en 45 grados, pies despegados del suelo.',
          'Gira el torso hacia un costado y luego hacia el otro con control abdominal.',
          'Mantén la espalda recta en todo momento.'
        ]),
        sets: JSON.stringify([
          { reps: 20, weight: 0 },
          { reps: 20, weight: 0 },
          { reps: 20, weight: 0 }
        ]),
        maquina_id: 'maq-esterilla'
      }
    ];

    const rutinasEjercicios = [
      // Upper
      { rutina_id: 'upper', ejercicio_id: 'ex-mov-torso', orden: 1 },
      { rutina_id: 'upper', ejercicio_id: 'ex-flex-estandar', orden: 2 },
      { rutina_id: 'upper', ejercicio_id: 'ex-flex-inclinadas', orden: 3 },
      { rutina_id: 'upper', ejercicio_id: 'ex-apertura-pecho', orden: 4 },
      { rutina_id: 'upper', ejercicio_id: 'ex-press-hombros-banda', orden: 5 },
      { rutina_id: 'upper', ejercicio_id: 'ex-elevaciones-laterales', orden: 6 },
      { rutina_id: 'upper', ejercicio_id: 'ex-fondos-dips', orden: 7 },

      // Lower
      { rutina_id: 'lower', ejercicio_id: 'ex-mov-cadera', orden: 1 },
      { rutina_id: 'lower', ejercicio_id: 'ex-sentadilla-bodyweight', orden: 2 },
      { rutina_id: 'lower', ejercicio_id: 'ex-estocadas-lunges', orden: 3 },
      { rutina_id: 'lower', ejercicio_id: 'ex-puente-gluteos-banda', orden: 4 },

      // Core
      { rutina_id: 'core', ejercicio_id: 'ex-crunch-abdominal', orden: 1 },
      { rutina_id: 'core', ejercicio_id: 'ex-elevacion-piernas', orden: 2 },
      { rutina_id: 'core', ejercicio_id: 'ex-plancha-estatica', orden: 3 },

      // Upper Selected
      { rutina_id: 'upper_selected', ejercicio_id: 'ex-mov-torso-sel', orden: 1 },
      { rutina_id: 'upper_selected', ejercicio_id: 'ex-flex-explosivas', orden: 2 },
      { rutina_id: 'upper_selected', ejercicio_id: 'ex-press-militar-banda', orden: 3 },
      { rutina_id: 'upper_selected', ejercicio_id: 'ex-apertura-doble-banda', orden: 4 },
      { rutina_id: 'upper_selected', ejercicio_id: 'ex-fondos-dips-explosivos', orden: 5 },

      // Lower Selected
      { rutina_id: 'lower_selected', ejercicio_id: 'ex-mov-cadera-din', orden: 1 },
      { rutina_id: 'lower_selected', ejercicio_id: 'ex-sentadilla-salto-plio', orden: 2 },
      { rutina_id: 'lower_selected', ejercicio_id: 'ex-estocadas-plio-alt', orden: 3 },
      { rutina_id: 'lower_selected', ejercicio_id: 'ex-puente-gluteos-uni', orden: 4 },

      // Core Selected
      { rutina_id: 'core_selected', ejercicio_id: 'ex-plancha-toque-hombros', orden: 1 },
      { rutina_id: 'core_selected', ejercicio_id: 'ex-elevacion-rodillas-pecho', orden: 2 },
      { rutina_id: 'core_selected', ejercicio_id: 'ex-giros-rusos-tension', orden: 3 }
    ];

    db.serialize(() => {
      const stmtMaq = db.prepare("INSERT INTO maquinas (id, nombre, descripcion, ubicacion_o_zona) VALUES (?, ?, ?, ?)");
      maquinas.forEach(m => stmtMaq.run([m.id, m.nombre, m.descripcion, m.ubicacion_o_zona]));
      stmtMaq.finalize();

      const stmtRut = db.prepare("INSERT INTO rutinas (id, nombre, duration) VALUES (?, ?, ?)");
      rutinas.forEach(r => stmtRut.run([r.id, r.nombre, r.duration]));
      stmtRut.finalize();

      const stmtEj = db.prepare("INSERT INTO ejercicios (id, nombre, muscle, animationClass, videoUrl, instructions, sets, maquina_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      ejercicios.forEach(e => stmtEj.run([e.id, e.nombre, e.muscle, e.animationClass, e.videoUrl, e.instructions, e.sets, e.maquina_id]));
      stmtEj.finalize();

      const stmtRe = db.prepare("INSERT INTO rutinas_ejercicios (rutina_id, ejercicio_id, orden) VALUES (?, ?, ?)");
      rutinasEjercicios.forEach(re => stmtRe.run([re.rutina_id, re.ejercicio_id, re.orden]));
      stmtRe.finalize();

      console.log("Sembrado de base de datos finalizado con éxito.");
    });
  });
}

function saveUser(user, callback) {
  const newId = user.id || `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const daysStr = Array.isArray(user.days) ? JSON.stringify(user.days) : (user.days || '[]');
  const cleanRut = getRunFromRut(user.rut || '');

  db.get("SELECT password_hash, isElite, paymentDate, expirationDate, registrationDate, paymentDueDate FROM users WHERE id = ?", [newId], (err, row) => {
    const passwordHash = user.password_hash || (row ? row.password_hash : null);
    const isElite = (user.isElite !== undefined) ? user.isElite : (row ? row.isElite : 0);
    const paymentDate = user.paymentDate !== undefined ? user.paymentDate : (row ? row.paymentDate : null);
    const expirationDate = user.expirationDate !== undefined ? user.expirationDate : (row ? row.expirationDate : null);
    const registrationDate = user.registrationDate !== undefined ? user.registrationDate : (row ? row.registrationDate : null);
    const paymentDueDate = user.paymentDueDate !== undefined ? user.paymentDueDate : (row ? row.paymentDueDate : null);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users 
      (id, name, age, sex, weight, height, goal, level, streak, assignedCluster, profileType, muscleMass, skeletalMuscle, injured, injuryDetails, rut, email, imc, bodyFat, waist, neck, hip, days, password_hash, isElite, paymentDate, expirationDate, registrationDate, paymentDueDate, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      newId, user.name, user.age, user.sex, user.weight, user.height,
      user.goal, user.level, user.streak, user.assignedCluster || 'Pendiente',
      user.profileType || 'estudiante', user.muscleMass || 0.0, user.skeletalMuscle || 0.0,
      user.injured ? 1 : 0, user.injuryDetails || '', cleanRut, user.email || '',
      user.imc || 0.0, user.bodyFat || 0.0, user.waist || 0.0, user.neck || 0.0, user.hip || 0.0,
      daysStr, passwordHash, isElite, paymentDate, expirationDate, registrationDate, paymentDueDate, user.phone || null
    ], function(runErr) {
      if (runErr) {
        stmt.finalize();
        callback(runErr);
        return;
      }
      stmt.finalize();

      // Guardar métricas históricas de forma inteligente
      db.get(`
        SELECT * FROM historial_metricas 
        WHERE user_id = ? 
        ORDER BY fecha DESC LIMIT 1
      `, [newId], (historyErr, lastRecord) => {
        if (historyErr) {
          console.error("Error consultando último historial de métricas:", historyErr);
          callback(null);
          return;
        }

        // Comparar métricas actuales con el último registro
        const w = parseFloat(user.weight) || 0.0;
        const h = parseFloat(user.height) || 0.0;
        const mm = parseFloat(user.muscleMass) || 0.0;
        const sm = parseFloat(user.skeletalMuscle) || 0.0;
        const imc = parseFloat(user.imc) || 0.0;
        const bf = parseFloat(user.bodyFat) || 0.0;
        const waist = parseFloat(user.waist) || 0.0;
        const neck = parseFloat(user.neck) || 0.0;
        const hip = parseFloat(user.hip) || 0.0;

        const hasChanged = !lastRecord || 
          Math.abs((lastRecord.weight || 0.0) - w) > 0.01 ||
          Math.abs((lastRecord.height || 0.0) - h) > 0.01 ||
          Math.abs((lastRecord.muscle_mass || 0.0) - mm) > 0.01 ||
          Math.abs((lastRecord.skeletal_muscle || 0.0) - sm) > 0.01 ||
          Math.abs((lastRecord.imc || 0.0) - imc) > 0.01 ||
          Math.abs((lastRecord.body_fat || 0.0) - bf) > 0.01 ||
          Math.abs((lastRecord.waist || 0.0) - waist) > 0.01 ||
          Math.abs((lastRecord.neck || 0.0) - neck) > 0.01 ||
          Math.abs((lastRecord.hip || 0.0) - hip) > 0.01;

        if (hasChanged) {
          db.run(`
            INSERT INTO historial_metricas 
            (user_id, weight, height, muscle_mass, skeletal_muscle, imc, body_fat, waist, neck, hip)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [newId, w, h, mm, sm, imc, bf, waist, neck, hip], (insertErr) => {
            if (insertErr) {
              console.error("Error insertando métricas en el historial:", insertErr);
            } else {
              console.log(`Métricas históricas registradas para el usuario ${newId}.`);
            }
            callback(null);
          });
        } else {
          callback(null);
        }
      });
    });
  });
}

function saveLog(log, callback) {
  const stmt = db.prepare(`
    INSERT INTO logs 
    (id, userId, date, routineName, duration, volume, setsCount) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    log.id, log.userId, log.date, log.routineName, log.duration, log.volume, log.setsCount
  ], function(err) {
    callback(err);
  });
  stmt.finalize();
}

function saveAttendance(att, callback) {
  const stmt = db.prepare(`
    INSERT INTO attendance (id, userId, date, type, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run([
    att.id || `att-${Date.now()}`, att.userId, att.date || new Date().toISOString(), att.type || 'standard', att.notes || ''
  ], function(err) {
    callback(err);
  });
  stmt.finalize();
}

function getAttendanceList(callback) {
  db.all(`
    SELECT a.*, u.name as userName, u.profileType, u.email as userEmail 
    FROM (
      SELECT id, userId, date, type, notes FROM attendance
      UNION ALL
      SELECT id, usuario_id as userId, 
             (CASE WHEN fecha_hora LIKE '%Z' THEN fecha_hora ELSE fecha_hora || 'Z' END) as date, 
             'qr' as type, 
             'Acceso QR general' as notes 
      FROM asistencia
    ) a 
    LEFT JOIN users u ON a.userId = u.id
    ORDER BY a.date DESC
  `, (err, rows) => {
    callback(err, rows);
  });
}

function getAttendanceHistory(callback) {
  db.all(`
    SELECT a.*, u.name as userName 
    FROM asistencia a 
    LEFT JOIN users u ON a.usuario_id = u.id 
    ORDER BY a.fecha_hora DESC
  `, (err, rows) => {
    callback(err, rows);
  });
}


function getRoutinesWithExercisesAndMachines(callback) {
  const query = `
    SELECT 
      r.id AS routine_id, 
      r.nombre AS routine_name, 
      r.duration AS routine_duration,
      e.id AS exercise_id, 
      e.nombre AS exercise_name, 
      e.muscle AS exercise_muscle, 
      e.animationClass AS exercise_animationClass, 
      e.videoUrl AS exercise_videoUrl, 
      e.instructions AS exercise_instructions, 
      e.sets AS exercise_sets,
      m.id AS maquina_id, 
      m.nombre AS maquina_name, 
      m.descripcion AS maquina_desc, 
      m.ubicacion_o_zona AS maquina_zona
    FROM rutinas r
    JOIN rutinas_ejercicios re ON r.id = re.rutina_id
    JOIN ejercicios e ON re.ejercicio_id = e.id
    LEFT JOIN maquinas m ON e.maquina_id = m.id
    ORDER BY r.id, re.orden
  `;
  db.all(query, (err, rows) => {
    callback(err, rows);
  });
}

function registrarAsistenciaQR(usuario_id, callback) {
  const id = `asist-qr-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO asistencia (id, usuario_id)
    VALUES (?, ?)
  `);
  stmt.run([id, usuario_id], function(err) {
    callback(err, { id, usuario_id });
  });
  stmt.finalize();
}

function obtenerUltimaAsistenciaUsuario(usuario_id, callback) {
  db.get(`
    SELECT * FROM asistencia 
    WHERE usuario_id = ? 
    ORDER BY fecha_hora DESC LIMIT 1
  `, [usuario_id], (err, row) => {
    callback(err, row);
  });
}

// Nuevas funciones para Usuarios Habilitados
function addUsuarioHabilitado(rut, dias_permitidos, es_exento, limite_semanal, fecha_registro, email, profileType, callback) {
  let actualProfileType = 'estudiante';
  let cb = callback;
  if (typeof profileType === 'function') {
    cb = profileType;
    actualProfileType = es_exento ? 'deportista_seleccionado' : 'estudiante';
  } else {
    actualProfileType = profileType || 'estudiante';
  }

  const cleanRut = getRunFromRut(rut);
  const finalDate = fecha_registro || new Date().toISOString().replace('T', ' ').substring(0, 19);
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO usuarios_habilitados (rut, dias_permitidos, es_exento, limite_semanal, fecha_registro, email, profileType)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([cleanRut, dias_permitidos, es_exento ? 1 : 0, parseInt(limite_semanal) || 0, finalDate, email || null, actualProfileType], function(err) {
    cb(err);
  });
  stmt.finalize();
}

function checkHabilitacion(rut, callback) {
  const cleanRut = getRunFromRut(rut);
  db.get("SELECT * FROM usuarios_habilitados WHERE rut = ?", [cleanRut], (err, row) => {
    callback(err, row);
  });
}

function checkHabilitacionByEmail(email, callback) {
  const cleanEmail = (email || '').toLowerCase().trim();
  db.get("SELECT * FROM usuarios_habilitados WHERE LOWER(email) = ?", [cleanEmail], (err, row) => {
    callback(err, row);
  });
}

function getAllHabilitaciones(callback) {
  db.all("SELECT * FROM usuarios_habilitados", [], (err, rows) => {
    callback(err, rows);
  });
}

function getAdminByUsername(username, callback) {
  db.get("SELECT * FROM administradores WHERE username = ?", [username], (err, row) => {
    callback(err, row);
  });
}

async function createAdmin(username, plainPassword, callback) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);
    db.run("INSERT INTO administradores (username, password_hash) VALUES (?, ?)", [username, hash], function(err) {
      if (callback) callback(err, this ? this.lastID : null);
    });
  } catch (err) {
    if (callback) callback(err);
  }
}


function decrementarDiasPermitidos(rut, callback) {
  const cleanRut = getRunFromRut(rut);
  db.run(`
    UPDATE usuarios_habilitados 
    SET dias_permitidos = dias_permitidos - 1 
    WHERE rut = ? AND dias_permitidos > 0 AND es_exento = 0
  `, [cleanRut], function(err) {
    callback(err);
  });
}

function getUserById(id, callback) {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    callback(err, row);
  });
}

function getUserByRut(rut, callback) {
  const cleanRut = getRunFromRut(rut);
  db.get("SELECT * FROM users WHERE rut = ?", [cleanRut], (err, row) => {
    callback(err, row);
  });
}

function getUserByEmail(email, callback) {
  const cleanEmail = (email || '').toLowerCase().trim();
  db.get("SELECT * FROM users WHERE LOWER(email) = ?", [cleanEmail], (err, row) => {
    callback(err, row);
  });
}

function getAllUsers(callback) {
  db.all("SELECT * FROM users WHERE rut IS NOT NULL AND rut != ''", [], (err, rows) => {
    callback(err, rows);
  });
}

function saveWebNotification(user_id, message, callback) {
  const stmt = db.prepare(`
    INSERT INTO notificaciones_web (user_id, message) 
    VALUES (?, ?)
  `);
  stmt.run([user_id, message], function(err) {
    callback(err, this ? this.lastID : null);
  });
  stmt.finalize();
}

function getUnreadNotifications(user_id, callback) {
  db.all("SELECT * FROM notificaciones_web WHERE user_id = ? AND is_read = 0 ORDER BY fecha_hora DESC", [user_id], (err, rows) => {
    callback(err, rows);
  });
}

function markNotificationAsRead(id, callback) {
  db.run("UPDATE notificaciones_web SET is_read = 1 WHERE id = ?", [id], function(err) {
    callback(err);
  });
}

// ==========================================
// NUEVO: Progresión de Atletas
// ==========================================
function saveProgression(user_id, exercise_name, weight, reps, callback) {
    const query = `INSERT INTO progresion_atletas (user_id, exercise_name, weight, reps) VALUES (?, ?, ?, ?)`;
    db.run(query, [user_id, exercise_name, weight, reps], function(err) {
        if(callback) callback(err, this ? this.lastID : null);
    });
}

function getProgressionHistory(user_id, exercise_name, callback) {
    let query = `SELECT * FROM progresion_atletas WHERE user_id = ?`;
    let params = [user_id];
    
    if (exercise_name) {
        query += ` AND exercise_name = ?`;
        params.push(exercise_name);
    }
    
    query += ` ORDER BY date DESC`;
    
    db.all(query, params, callback);
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

function migrateAndNormalizeRuts() {
  db.all("SELECT id, rut, dias_permitidos, es_exento FROM usuarios_habilitados", [], (err, rows) => {
    if (err) {
      console.error("Error migrating RUTs in usuarios_habilitados:", err);
      return;
    }

    const groups = {};
    rows.forEach(row => {
      const norm = getRunFromRut(row.rut);
      if (!groups[norm]) groups[norm] = [];
      groups[norm].push(row);
    });

    db.serialize(() => {
      for (const norm in groups) {
        const group = groups[norm];
        
        if (group.length === 1) {
          const row = group[0];
          if (row.rut !== norm) {
            db.run("UPDATE usuarios_habilitados SET rut = ? WHERE id = ?", [norm, row.id], (err) => {
              if (err) console.error(`Error updating rut for id ${row.id} to ${norm}:`, err);
            });
          }
        } else if (group.length > 1) {
          group.sort((a, b) => {
            if (a.es_exento !== b.es_exento) {
              return b.es_exento - a.es_exento;
            }
            return b.dias_permitidos - a.dias_permitidos;
          });

          const mainRow = group[0];
          
          for (let i = 1; i < group.length; i++) {
            const dupRow = group[i];
            db.run("DELETE FROM usuarios_habilitados WHERE id = ?", [dupRow.id], (err) => {
              if (err) console.error(`Error deleting duplicate habilitacion for id ${dupRow.id}:`, err);
            });
          }

          db.run("UPDATE usuarios_habilitados SET rut = ? WHERE id = ?", [norm, mainRow.id], (err) => {
            if (err) console.error(`Error updating main rut for id ${mainRow.id} to ${norm}:`, err);
          });

          console.log(`Merged ${group.length} habilitaciones for RUT ${norm} (kept id ${mainRow.id})`);
        }
      }
      
      db.all("SELECT id, name, rut FROM users WHERE rut IS NOT NULL AND rut != ''", [], (err, uRows) => {
        if (!err && uRows) {
          uRows.forEach(uRow => {
            const norm = getRunFromRut(uRow.rut);
            if (uRow.rut !== norm) {
              db.run("UPDATE users SET rut = ? WHERE id = ?", [norm, uRow.id], (err) => {
                if (err) console.error(`Error normalizing user rut for ${uRow.name}:`, err);
              });
            }
          });
        }
      });
    });
  });
}

function deleteUser(id, callback) {
  db.get("SELECT rut FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return callback(err);

    const rut = row ? row.rut : null;

    db.serialize(() => {
      db.run("DELETE FROM logs WHERE userId = ?", [id]);
      db.run("DELETE FROM attendance WHERE userId = ?", [id]);
      db.run("DELETE FROM asistencia WHERE usuario_id = ?", [id]);
      db.run("DELETE FROM progresion_atletas WHERE user_id = ?", [id]);
      db.run("DELETE FROM notificaciones_web WHERE user_id = ?", [id]);
      db.run("DELETE FROM users WHERE id = ?", [id]);
      if (rut) {
        db.run("DELETE FROM usuarios_habilitados WHERE rut = ?", [rut]);
      }
      db.run("SELECT 1", [], (err) => {
        callback(err);
      });
    });
  });
}

function resetUserData(id, callback) {
  db.serialize(() => {
    db.run("DELETE FROM logs WHERE userId = ?", [id]);
    db.run("DELETE FROM attendance WHERE userId = ?", [id]);
    db.run("DELETE FROM asistencia WHERE usuario_id = ?", [id]);
    db.run("DELETE FROM progresion_atletas WHERE user_id = ?", [id]);
    db.run("DELETE FROM notificaciones_web WHERE user_id = ?", [id]);
    db.run("DELETE FROM historial_metricas WHERE user_id = ?", [id]);
    db.run("DELETE FROM users WHERE id = ?", [id]);
    db.run("SELECT 1", [], (err) => {
      callback(err);
    });
  });
}

function checkUserAttendanceForDate(userId, dateStr, callback) {
  // 1. Convertir la fecha de consulta a fecha local de Chile (America/Santiago) en formato YYYY-MM-DD
  let targetLocalDate;
  try {
    targetLocalDate = new Date(dateStr).toLocaleDateString('sv-SE', { timeZone: 'America/Santiago' });
  } catch (e) {
    targetLocalDate = dateStr.slice(0, 10);
  }

  // 2. Buscar en la tabla de asistencias manuales (attendance)
  db.all("SELECT date FROM attendance WHERE userId = ?", [userId], (err, rowsAtt) => {
    if (err) return callback(err);

    // 3. Buscar en la tabla de asistencias QR (asistencia)
    db.all("SELECT fecha_hora FROM asistencia WHERE usuario_id = ?", [userId], (err, rowsAsist) => {
      if (err) return callback(err);

      const dates = [];
      if (rowsAtt) {
        rowsAtt.forEach(r => { if (r.date) dates.push(r.date); });
      }
      if (rowsAsist) {
        rowsAsist.forEach(r => {
          if (r.fecha_hora) {
            // SQLite guarda el timestamp en UTC, añadimos 'Z' para parsearlo correctamente como UTC
            const dateVal = r.fecha_hora.includes('Z') ? r.fecha_hora : r.fecha_hora + 'Z';
            dates.push(dateVal);
          }
        });
      }

      // 4. Comparar las fechas resultantes convertidas a la zona horaria America/Santiago
      const hasRegistered = dates.some(d => {
        try {
          const localD = new Date(d).toLocaleDateString('sv-SE', { timeZone: 'America/Santiago' });
          return localD === targetLocalDate;
        } catch (e) {
          return false;
        }
      });

      callback(null, hasRegistered);
    });
  });
}

function checkUserWeeklyLimit(userId, callback) {
  getUserById(userId, (err, user) => {
    if (err) return callback(err);
    if (!user || !user.rut) return callback(null, { allowed: true, limit: 0, count: 0, exento: true });

    const cleanRut = getRunFromRut(user.rut);
    db.get("SELECT limite_semanal, es_exento FROM usuarios_habilitados WHERE rut = ?", [cleanRut], (err, hab) => {
      if (err) return callback(err);
      if (!hab) {
        return callback(null, { allowed: true, limit: 0, count: 0, exento: false });
      }

      const limit = hab.limite_semanal || 0;
      const esExento = !!hab.es_exento;

      // Obtener todas las asistencias del usuario en ambas tablas
      db.all("SELECT date FROM attendance WHERE userId = ?", [userId], (err, rowsAtt) => {
        if (err) return callback(err);
        db.all("SELECT fecha_hora FROM asistencia WHERE usuario_id = ?", [userId], (err, rowsAsist) => {
          if (err) return callback(err);

          const dates = [];
          if (rowsAtt) {
            rowsAtt.forEach(r => { if (r.date) dates.push(r.date); });
          }
          if (rowsAsist) {
            rowsAsist.forEach(r => {
              if (r.fecha_hora) {
                const dateVal = r.fecha_hora.includes('Z') ? r.fecha_hora : r.fecha_hora + 'Z';
                dates.push(dateVal);
              }
            });
          }

          // Calcular el inicio de la semana actual en hora de Chile
          const now = new Date();
          const santiagoStr = now.toLocaleString("en-US", { timeZone: "America/Santiago" });
          const santiagoNow = new Date(santiagoStr);
          const day = santiagoNow.getDay();
          const daysToSub = day === 0 ? 6 : day - 1;
          
          const startOfWeek = new Date(santiagoNow);
          startOfWeek.setDate(santiagoNow.getDate() - daysToSub);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);

          // Contar asistencias en la semana actual
          let weekCount = 0;
          dates.forEach(d => {
            try {
              const dStr = new Date(d).toLocaleString("en-US", { timeZone: "America/Santiago" });
              const localD = new Date(dStr);
              if (localD >= startOfWeek && localD < endOfWeek) {
                weekCount++;
              }
            } catch (e) {
              // ignorar
            }
          });

          const allowed = esExento || limit === 0 || weekCount < limit;
          callback(null, { allowed: allowed, limit: limit, count: weekCount, exento: esExento });
        });
      });
    });
  });
}

function updateUserProfileType(rut, profileType, callback) {
  db.run("UPDATE users SET profileType = ? WHERE rut = ?", [profileType, rut], callback);
}

function updateUserProfileTypeAndEmail(rut, profileType, email, callback) {
  if (email) {
    db.run("UPDATE users SET profileType = ?, email = ? WHERE rut = ?", [profileType, email, rut], callback);
  } else {
    db.run("UPDATE users SET profileType = ? WHERE rut = ?", [profileType, rut], callback);
  }
}

function getUserMetricsHistory(userId, callback) {
  db.all(`
    SELECT * FROM historial_metricas 
    WHERE user_id = ? 
    ORDER BY fecha ASC
  `, [userId], callback);
}

function getUserAttendanceHistory(userId, callback) {
  db.all("SELECT date, type, notes FROM attendance WHERE userId = ?", [userId], (err, rowsAtt) => {
    if (err) return callback(err);
    db.all("SELECT fecha_hora FROM asistencia WHERE usuario_id = ?", [userId], (err, rowsAsist) => {
      if (err) return callback(err);

      const list = [];
      if (rowsAtt) {
        rowsAtt.forEach(r => {
          list.push({
            date: r.date,
            type: r.type || 'standard',
            notes: r.notes || ''
          });
        });
      }
      if (rowsAsist) {
        rowsAsist.forEach(r => {
          if (r.fecha_hora) {
            const dateVal = r.fecha_hora.includes('Z') ? r.fecha_hora : r.fecha_hora + 'Z';
            list.push({
              date: dateVal,
              type: 'standard',
              notes: 'Acceso por código QR'
            });
          }
        });
      }

      // Ordenar por fecha descendente (más reciente primero)
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      callback(null, list);
    });
  });
}

function saveRoutine(routineData, callback) {
  const { id, name, duration, exercises } = routineData;
  db.serialize(() => {
    db.run("INSERT OR REPLACE INTO rutinas (id, nombre, duration) VALUES (?, ?, ?)", [id, name, duration], (err) => {
      if (err) return callback(err);
    });
    
    db.run("DELETE FROM rutinas_ejercicios WHERE rutina_id = ?", [id], (err) => {
      if (err) return callback(err);
    });

    if (exercises && exercises.length > 0) {
      let completed = 0;
      let hasError = false;

      exercises.forEach((ex, index) => {
        if (hasError) return;
        const exId = ex.id || 'ex-' + ex.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const instrsStr = Array.isArray(ex.instructions) ? JSON.stringify(ex.instructions) : (ex.instructions || '[]');
        const setsStr = Array.isArray(ex.sets) ? JSON.stringify(ex.sets) : (ex.sets || '[]');
        const maqId = ex.maquina_id || 'maq-libre';

        db.run(`
          INSERT OR REPLACE INTO ejercicios (id, nombre, muscle, animationClass, videoUrl, instructions, sets, maquina_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [exId, ex.name, ex.muscle, ex.animationClass, ex.videoUrl, instrsStr, setsStr, maqId], (err) => {
          if (err) {
            hasError = true;
            return callback(err);
          }

          db.run("INSERT INTO rutinas_ejercicios (rutina_id, ejercicio_id, orden) VALUES (?, ?, ?)", [id, exId, index], (err) => {
            if (err) {
              hasError = true;
              return callback(err);
            }
            completed++;
            if (completed === exercises.length) {
              callback(null);
            }
          });
        });
      });
    } else {
      callback(null);
    }
  });
}

function getComunicados(profileType, callback) {
  if (profileType) {
    db.all(`
      SELECT * FROM comunicados 
      WHERE targetGroup = 'all' OR targetGroup = ?
      ORDER BY date DESC
    `, [profileType], callback);
  } else {
    db.all("SELECT * FROM comunicados ORDER BY date DESC", [], callback);
  }
}

function addComunicado(comunicado, callback) {
  const { title, content, targetGroup } = comunicado;
  db.run(`
    INSERT INTO comunicados (title, content, targetGroup)
    VALUES (?, ?, ?)
  `, [title, content, targetGroup || 'all'], callback);
}

function updateUserAdminFields(userId, fields, callback) {
  const { isElite, paymentDate, expirationDate, registrationDate, paymentDueDate } = fields;
  const isEliteInt = isElite ? 1 : 0;
  db.run(`
    UPDATE users 
    SET isElite = ?, paymentDate = ?, expirationDate = ?, registrationDate = ?, paymentDueDate = ?
    WHERE id = ?
  `, [isEliteInt, paymentDate, expirationDate, registrationDate, paymentDueDate, userId], (err) => {
    if (err) return callback(err);

    // Sincronizar fecha de registro a la tabla de usuarios habilitados
    db.get("SELECT rut FROM users WHERE id = ?", [userId], (getErr, row) => {
      if (row && row.rut) {
        const cleanRut = getRunFromRut(row.rut);
        const dateVal = registrationDate ? registrationDate.replace('T', ' ').substring(0, 19) : null;
        if (dateVal) {
          db.run("UPDATE usuarios_habilitados SET fecha_registro = ? WHERE rut = ?", [dateVal, cleanRut], (updateErr) => {
            callback(updateErr);
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  });
}

function renewUserPlan(userId, callback) {
  db.get("SELECT paymentDueDate, expirationDate FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) return callback(err);
    let baseDate = new Date();
    const existingDueDateStr = row ? (row.paymentDueDate || row.expirationDate) : null;
    if (existingDueDateStr) {
      const currentExp = new Date(existingDueDateStr);
      if (currentExp > baseDate) {
        baseDate = currentExp;
      }
    }
    baseDate.setDate(baseDate.getDate() + 30);
    const newDueDateISO = baseDate.toISOString();
    const newExpStr = newDueDateISO.slice(0, 10);
    const newRegistrationDateISO = new Date().toISOString();
    
    db.run("UPDATE users SET expirationDate = ?, registrationDate = ?, paymentDueDate = ? WHERE id = ?", 
      [newExpStr, newRegistrationDateISO, newDueDateISO, userId], (err) => {
      if (err) return callback(err);
      
      db.get("SELECT rut FROM users WHERE id = ?", [userId], (err, userRow) => {
        if (userRow && userRow.rut) {
          const cleanRut = getRunFromRut(userRow.rut);
          const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
          db.run("UPDATE usuarios_habilitados SET fecha_registro = ? WHERE rut = ?", [nowStr, cleanRut], () => {
            callback(null, newDueDateISO);
          });
        } else {
          callback(null, newDueDateISO);
        }
      });
    });
  });
}

function updateUserHabilitationFields(rut, fields, callback) {
  const cleanRut = getRunFromRut(rut);
  const { profileType, email, registrationDate, paymentDueDate, isElite } = fields;
  const isEliteInt = isElite ? 1 : 0;
  const expirationDate = paymentDueDate ? paymentDueDate.slice(0, 10) : null;

  db.run(`
    UPDATE users 
    SET profileType = ?, email = ?, registrationDate = ?, paymentDueDate = ?, expirationDate = ?, isElite = ? 
    WHERE rut = ?
  `, [profileType || 'estudiante', email || '', registrationDate, paymentDueDate, expirationDate, isEliteInt, cleanRut], callback);
}

function savePasswordResetCode(email, code, expiresAt, callback) {
  db.run(`
    INSERT OR REPLACE INTO password_resets (email, code, expires_at)
    VALUES (?, ?, ?)
  `, [email.toLowerCase(), code, expiresAt], callback);
}

function getPasswordResetCode(email, callback) {
  db.get(`
    SELECT code, expires_at FROM password_resets WHERE email = ?
  `, [email.toLowerCase()], callback);
}

function deletePasswordResetCode(email, callback) {
  db.run(`
    DELETE FROM password_resets WHERE email = ?
  `, [email.toLowerCase()], callback);
}

function updateUserPasswordByEmail(email, passwordHash, callback) {
  db.run(`
    UPDATE users SET password_hash = ? WHERE email = ?
  `, [passwordHash, email.toLowerCase()], callback);
}

module.exports = {
  dbPath,
  initDb,
  saveUser,
  saveLog,
  saveAttendance,
  getAttendanceList,
  getAttendanceHistory,
  getRoutinesWithExercisesAndMachines,
  registrarAsistenciaQR,
  obtenerUltimaAsistenciaUsuario,
  addUsuarioHabilitado,
  checkHabilitacion,
  checkHabilitacionByEmail,
  getAllHabilitaciones,
  getAdminByUsername,
  createAdmin,
  decrementarDiasPermitidos,
  getUserById,
  getUserByRut,
  getUserByEmail,
  getAllUsers,
  saveWebNotification,
  getUnreadNotifications,
  markNotificationAsRead,
  saveProgression,
  getProgressionHistory,
  deleteUser,
  resetUserData,
  checkUserAttendanceForDate,
  checkUserWeeklyLimit,
  updateUserProfileType,
  updateUserProfileTypeAndEmail,
  getUserMetricsHistory,
  getUserAttendanceHistory,
  saveRoutine,
  getComunicados,
  addComunicado,
  updateUserAdminFields,
  renewUserPlan,
  savePasswordResetCode,
  getPasswordResetCode,
  deletePasswordResetCode,
  updateUserPasswordByEmail,
  updateUserHabilitationFields,
  db
};
