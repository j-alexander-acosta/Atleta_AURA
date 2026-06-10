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
        assignedCluster TEXT
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

    console.log('Base de datos inicializada correctamente.');
  });
}

function saveUser(user, callback) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users 
    (id, name, age, sex, weight, height, goal, level, streak, assignedCluster) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    user.id, user.name, user.age, user.sex, user.weight, user.height,
    user.goal, user.level, user.streak, user.assignedCluster || 'Pendiente'
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

module.exports = {
  dbPath,
  initDb,
  saveUser,
  saveLog
};
