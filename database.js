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
        injuryDetails TEXT DEFAULT ''
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

    // Tabla de Usuarios Habilitados
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios_habilitados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rut TEXT UNIQUE NOT NULL,
        dias_permitidos INTEGER DEFAULT 0,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        es_exento BOOLEAN DEFAULT 0
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
          });
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
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users 
    (id, name, age, sex, weight, height, goal, level, streak, assignedCluster, profileType, muscleMass, skeletalMuscle, injured, injuryDetails, rut, email) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    user.id, user.name, user.age, user.sex, user.weight, user.height,
    user.goal, user.level, user.streak, user.assignedCluster || 'Pendiente',
    user.profileType || 'estudiante', user.muscleMass || 0.0, user.skeletalMuscle || 0.0,
    user.injured ? 1 : 0, user.injuryDetails || '', user.rut || '', user.email || ''
  ], function(err) {
    callback(err);
  });
  stmt.finalize();
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
    SELECT a.*, u.name as userName, u.profileType 
    FROM attendance a 
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
function addUsuarioHabilitado(rut, dias_permitidos, es_exento, callback) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO usuarios_habilitados (rut, dias_permitidos, es_exento)
    VALUES (?, ?, ?)
  `);
  stmt.run([rut, dias_permitidos, es_exento ? 1 : 0], function(err) {
    callback(err);
  });
  stmt.finalize();
}

function checkHabilitacion(rut, callback) {
  db.get("SELECT * FROM usuarios_habilitados WHERE rut = ?", [rut], (err, row) => {
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

function decrementarDiasPermitidos(rut, callback) {
  db.run(`
    UPDATE usuarios_habilitados 
    SET dias_permitidos = dias_permitidos - 1 
    WHERE rut = ? AND dias_permitidos > 0 AND es_exento = 0
  `, [rut], function(err) {
    callback(err);
  });
}

function getUserById(id, callback) {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    callback(err, row);
  });
}

function getUserByRut(rut, callback) {
  db.get("SELECT * FROM users WHERE rut = ?", [rut], (err, row) => {
    callback(err, row);
  });
}

function getAllUsers(callback) {
  db.all("SELECT * FROM users", [], (err, rows) => {
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
  getAllHabilitaciones,
  getAdminByUsername,
  decrementarDiasPermitidos,
  getUserById,
  getUserByRut,
  getAllUsers,
  saveWebNotification,
  getUnreadNotifications,
  markNotificationAsRead,
  saveProgression,
  getProgressionHistory
};
