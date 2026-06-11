const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

    console.log('Base de datos inicializada correctamente.');
  });
}

function saveUser(user, callback) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users 
    (id, name, age, sex, weight, height, goal, level, streak, assignedCluster, profileType, muscleMass, skeletalMuscle, injured, injuryDetails) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    user.id, user.name, user.age, user.sex, user.weight, user.height,
    user.goal, user.level, user.streak, user.assignedCluster || 'Pendiente',
    user.profileType || 'estudiante', user.muscleMass || 0.0, user.skeletalMuscle || 0.0,
    user.injured ? 1 : 0, user.injuryDetails || ''
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

module.exports = {
  dbPath,
  initDb,
  saveUser,
  saveLog,
  saveAttendance,
  getAttendanceList
};
