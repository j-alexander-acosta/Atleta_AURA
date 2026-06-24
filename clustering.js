/* ==========================================================================
   AURA FITNESS AI MOTOR - CLUSTERING & NOTIFICATIONS (JS)
   ========================================================================== */

const AURA_AI = (() => {
    // Función de Cálculo de Porcentaje de Grasa Corporal (Navy Seal Formula)
    const calculateNavySealBFP = (sex, height, waist, neck, hip) => {
        try {
            let val;
            if (sex === "male") {
                if (waist <= neck) return 20.0;
                val = 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height);
            } else {
                if (!hip || hip <= 0) hip = waist; // Fallback
                if ((waist + hip) <= neck) return 25.0;
                val = 1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height);
            }
            let bfp = (495.0 / val) - 450.0;
            if (isNaN(bfp) || !isFinite(bfp)) return 22.0;
            return Math.max(2.0, Math.min(bfp, 50.0));
        } catch (e) {
            return 22.0;
        }
    };

    // 1. Base de Datos Simulada Multi-Usuario (para demostración del Panel Admin)
    const getInitialMockDB = () => {
        const today = new Date();

        // Helper para crear fechas relativas a hoy
        const daysAgo = (days) => {
            const date = new Date(today);
            date.setDate(today.getDate() - days);
            return date.toISOString();
        };

        const mockUsers = [
            {
                id: "user-1",
                name: "Carlos Mendoza",
                age: 28,
                sex: "male",
                weight: 78.5,
                height: 176,
                waist: 84.0,
                neck: 38.0,
                hip: 0,
                goal: "hipertrofia",
                level: "avanzado",
                days: [1, 3, 5], // Lun, Mié, Vie
                streak: 6,
                lastWorkoutDate: daysAgo(1),
                assignedCluster: "Comprometido",
                bodyFat: 16.0,
                imc: 25.3,
                profileType: "estudiante",
                muscleMass: 42.5,
                skeletalMuscle: 38.0,
                injured: 0,
                injuryDetails: ""
            },
            {
                id: "user-2",
                name: "Laura Gómez",
                age: 32,
                sex: "female",
                weight: 62.0,
                height: 165,
                waist: 70.0,
                neck: 32.0,
                hip: 94.0,
                goal: "resistencia",
                level: "intermedio",
                days: [2, 4, 6], // Mar, Jue, Sáb
                streak: 4,
                lastWorkoutDate: daysAgo(2),
                assignedCluster: "Comprometido",
                bodyFat: 24.3,
                imc: 22.8,
                profileType: "deportista_seleccionado",
                muscleMass: 31.0,
                skeletalMuscle: 28.5,
                injured: 0,
                injuryDetails: ""
            },
            {
                id: "user-3",
                name: "Esteban Ruiz",
                age: 40,
                sex: "male",
                weight: 89.2,
                height: 180,
                waist: 96.0,
                neck: 40.0,
                hip: 0,
                goal: "fuerza",
                level: "principiante",
                days: [1, 4], // Lun, Jue
                streak: 0,
                lastWorkoutDate: daysAgo(4),
                assignedCluster: "Irregular",
                bodyFat: 22.6,
                imc: 27.5,
                profileType: "deportista_seleccionado",
                muscleMass: 44.2,
                skeletalMuscle: 39.1,
                injured: 1,
                injuryDetails: "Esguince de Tobillo Grado 2"
            },
            {
                id: "user-4",
                name: "Daniela Rivas",
                age: 24,
                sex: "female",
                weight: 55.4,
                height: 160,
                waist: 68.0,
                neck: 31.0,
                hip: 90.0,
                goal: "hipertrofia",
                level: "intermedio",
                days: [1, 3, 5], // Lun, Mié, Vie
                streak: 1,
                lastWorkoutDate: daysAgo(5),
                assignedCluster: "Irregular",
                bodyFat: 23.0,
                imc: 21.6,
                profileType: "estudiante",
                muscleMass: 27.5,
                skeletalMuscle: 25.0,
                injured: 0,
                injuryDetails: ""
            },
            {
                id: "user-5",
                name: "Javier Ortega",
                age: 35,
                sex: "male",
                weight: 95.0,
                height: 182,
                waist: 104.0,
                neck: 41.0,
                hip: 0,
                goal: "fuerza",
                level: "principiante",
                days: [3, 6], // Mié, Sáb
                streak: 0,
                lastWorkoutDate: daysAgo(10),
                assignedCluster: "Alto riesgo",
                bodyFat: 26.7,
                imc: 28.7,
                profileType: "estudiante",
                muscleMass: 46.0,
                skeletalMuscle: 41.2,
                injured: 0,
                injuryDetails: ""
            },
            {
                id: "user-6",
                name: "Mónica Silva",
                age: 29,
                sex: "female",
                weight: 68.1,
                height: 170,
                waist: 82.0,
                neck: 33.0,
                hip: 105.0,
                goal: "resistencia",
                level: "principiante",
                days: [2, 5], // Mar, Vie
                streak: 0,
                lastWorkoutDate: daysAgo(8),
                assignedCluster: "Alto riesgo",
                bodyFat: 33.9,
                imc: 23.6,
                profileType: "estudiante",
                muscleMass: 30.5,
                skeletalMuscle: 27.2,
                injured: 0,
                injuryDetails: ""
            }
        ];

        // Logs de entrenamiento históricos realistas de los últimos 14 días
        const mockLogs = [
            // Carlos Mendoza (Muy activo)
            { id: "log-1", userId: "user-1", date: daysAgo(1), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "45 min", volume: 1200, setsCount: 7, sets: [] },
            { id: "log-2", userId: "user-1", date: daysAgo(3), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "43 min", volume: 1500, setsCount: 10, sets: [] },
            { id: "log-3", userId: "user-1", date: daysAgo(5), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "44 min", volume: 1100, setsCount: 7, sets: [] },
            { id: "log-4", userId: "user-1", date: daysAgo(8), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "45 min", volume: 1600, setsCount: 10, sets: [] },
            { id: "log-5", userId: "user-1", date: daysAgo(10), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "42 min", volume: 1000, setsCount: 7, sets: [] },
            { id: "log-6", userId: "user-1", date: daysAgo(12), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "46 min", volume: 1400, setsCount: 10, sets: [] },

            // Laura Gómez (Activa)
            { id: "log-7", userId: "user-2", date: daysAgo(2), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "42 min", volume: 800, setsCount: 10, sets: [] },
            { id: "log-8", userId: "user-2", date: daysAgo(4), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "45 min", volume: 900, setsCount: 7, sets: [] },
            { id: "log-9", userId: "user-2", date: daysAgo(7), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "40 min", volume: 750, setsCount: 10, sets: [] },
            { id: "log-10", userId: "user-2", date: daysAgo(9), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "43 min", volume: 850, setsCount: 7, sets: [] },
            { id: "log-11", userId: "user-2", date: daysAgo(11), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "41 min", volume: 700, setsCount: 10, sets: [] },

            // Esteban Ruiz (Irregular - empezó a fallar)
            { id: "log-12", userId: "user-3", date: daysAgo(4), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "40 min", volume: 600, setsCount: 10, sets: [] },
            { id: "log-13", userId: "user-3", date: daysAgo(9), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "45 min", volume: 800, setsCount: 7, sets: [] },

            // Daniela Rivas (Irregular - falló recientemente)
            { id: "log-14", userId: "user-4", date: daysAgo(5), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "44 min", volume: 500, setsCount: 7, sets: [] },
            { id: "log-15", userId: "user-4", date: daysAgo(11), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "42 min", volume: 550, setsCount: 10, sets: [] },

            // Javier Ortega (Alto Riesgo - Inactivo hace 10 días)
            { id: "log-16", userId: "user-5", date: daysAgo(10), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "45 min", volume: 400, setsCount: 10, sets: [] },

            // Mónica Silva (Alto Riesgo - Inactiva hace 8 días)
            { id: "log-17", userId: "user-6", date: daysAgo(8), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "43 min", volume: 300, setsCount: 7, sets: [] }
        ];

        return { users: mockUsers, logs: mockLogs, attendance: [] };
    };

    // Inicializar localStorage si no existe
    let db = null;
    const loadDB = () => {
        const cached = localStorage.getItem('aura_system_db');
        if (cached) {
            db = JSON.parse(cached);
        } else {
            db = getInitialMockDB();
            localStorage.setItem('aura_system_db', JSON.stringify(db));
        }
        return db;
    };

    const saveDB = () => {
        if (db) {
            localStorage.setItem('aura_system_db', JSON.stringify(db));
        }
    };

    // Obtener los datos actuales de todos los usuarios
    const getUsers = () => {
        loadDB();
        // Sincronizar el usuario activo de la SPA si existe en localStorage
        const activeProfile = localStorage.getItem('aura_user_profile');
        const activeLogs = localStorage.getItem('aura_workout_history');

        if (activeProfile) {
            const userObj = JSON.parse(activeProfile);
            const userLogs = activeLogs ? JSON.parse(activeLogs) : [];

            // Buscar si ya existe en db
            const idx = db.users.findIndex(u => u.id === "active-user" || u.name.startsWith(userObj.name));

            const bfp = userObj.bodyFat || calculateNavySealBFP(
                userObj.sex,
                userObj.height,
                userObj.waist,
                userObj.neck,
                userObj.hip
            );

            const userRecord = {
                id: "active-user",
                name: userObj.name + " (Tú)",
                age: userObj.age,
                sex: userObj.sex || "male",
                weight: userObj.weight,
                height: userObj.height,
                waist: userObj.waist || 80.0,
                neck: userObj.neck || 37.0,
                hip: userObj.hip || 0.0,
                goal: userObj.goal,
                level: userObj.level,
                days: userObj.days,
                streak: userObj.streak,
                lastWorkoutDate: userObj.lastWorkoutDate,
                assignedCluster: userObj.assignedCluster || "Pendiente",
                bodyFat: parseFloat(bfp.toFixed(1)),
                imc: userObj.imc || parseFloat((userObj.weight / Math.pow(userObj.height / 100, 2)).toFixed(1)),
                profileType: userObj.profileType || "estudiante",
                muscleMass: userObj.muscleMass || 0.0,
                skeletalMuscle: userObj.skeletalMuscle || 0.0,
                injured: userObj.injured ? 1 : 0,
                injuryDetails: userObj.injuryDetails || ""
            };

            if (idx !== -1) {
                db.users[idx] = { ...db.users[idx], ...userRecord };
            } else {
                db.users.push(userRecord);
            }

            // Sincronizar logs del usuario activo
            db.logs = db.logs.filter(l => l.userId !== "active-user");
            userLogs.forEach((l, i) => {
                db.logs.push({
                    id: `active-log-${i}`,
                    userId: "active-user",
                    date: l.date,
                    routineName: l.routineName,
                    duration: l.duration,
                    volume: l.volume,
                    setsCount: l.setsCount,
                    sets: l.sets || []
                });
            });
            saveDB();
        }
        return db.users;
    };

    // Agregar un log de entrenamiento al sistema
    const addLog = (userId, logData) => {
        loadDB();
        const newLog = {
            id: `log-${Date.now()}`,
            userId: userId,
            date: new Date().toISOString(),
            ...logData
        };
        db.logs.push(newLog);

        // Actualizar la última fecha de entrenamiento en el usuario
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.lastWorkoutDate = newLog.date;
        }
        saveDB();
        return newLog;
    };

    // 2. Algoritmo K-Means para Clustering de Usuarios (3D: Frecuencia, Volumen/Progresión, Grasa Corporal)
    const runClustering = async (backendUsers) => {
        loadDB();
        const users = backendUsers || getUsers(); // Usa usuarios reales si se pasan, sino fallback
        const logs = db.logs;
        const today = new Date();

        // Calcular características para cada usuario
        const userFeatures = await Promise.all(users.map(async (user) => {
            const userLogs = logs.filter(l => l.userId === user.id);

            // Frecuencia: Entrenamientos en los últimos 14 días
            const logsLast14Days = userLogs.filter(l => {
                const diffTime = Math.abs(today - new Date(l.date));
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return diffDays <= 14;
            });
            const frequency = logsLast14Days.length;

            // Volumen Base: Volumen acumulativo en los últimos 14 días
            let volume = logsLast14Days.reduce((sum, l) => sum + (l.volume || 0), 0);

            // NUEVO: Análisis de Pendiente de Progresión
            try {
                const res = await fetch(`${window.location.origin}/api/progression?userId=${user.id}`);
                const data = await res.json();
                if (data.success && data.progression) {
                    const exercises = {};
                    data.progression.forEach(p => {
                        if (!exercises[p.exercise_name]) exercises[p.exercise_name] = [];
                        exercises[p.exercise_name].push(p.weight);
                    });

                    let totalSlope = 0;
                    let count = 0;
                    for (const ex in exercises) {
                        const w = exercises[ex].slice(0, 3).reverse(); // cronológico
                        if (w.length > 1) {
                            let slope = 0;
                            for (let i = 1; i < w.length; i++) {
                                slope += (w[i] - w[i - 1]);
                            }
                            totalSlope += slope;
                            count++;
                        }
                    }
                    const avgSlope = count > 0 ? totalSlope / count : 0;
                    // Modificador IA: Aumentar la métrica si hay tendencia positiva de sobrecarga progresiva
                    volume += (avgSlope * 100);
                }
            } catch (e) {
                console.error("Error analizando progresión para IA:", e);
            }

            // Grasa corporal calculada por Navy Seal
            const bfp = user.bodyFat || calculateNavySealBFP(
                user.sex || "male",
                user.height || 170,
                user.waist || 80,
                user.neck || 36,
                user.hip || 0
            );

            return {
                userId: user.id,
                name: user.name,
                rawFeatures: { frequency, volume, bfp }
            };
        }));

        // Normalización Min-Max
        const freqs = userFeatures.map(f => f.rawFeatures.frequency);
        const vols = userFeatures.map(f => f.rawFeatures.volume);
        const bfps = userFeatures.map(f => f.rawFeatures.bfp);

        const minFreq = Math.min(...freqs);
        const maxFreq = Math.max(...freqs);
        const minVol = Math.min(...vols);
        const maxVol = Math.max(...vols);
        const minBfp = Math.min(...bfps);
        const maxBfp = Math.max(...bfps);

        const rangeFreq = maxFreq - minFreq || 1;
        const rangeVol = maxVol - minVol || 1;
        const rangeBfp = maxBfp - minBfp || 1;

        const dataPoints = userFeatures.map(uf => {
            return {
                userId: uf.userId,
                name: uf.name,
                raw: uf.rawFeatures,
                // Normalizado a [0, 1]
                x: (uf.rawFeatures.frequency - minFreq) / rangeFreq, // Frecuencia
                y: (uf.rawFeatures.volume - minVol) / rangeVol,     // Volumen
                z: (uf.rawFeatures.bfp - minBfp) / rangeBfp        // Grasa Corporal
            };
        });

        // Inicialización de 3 centroides en 3D
        // C0 (Comprometido): Alta frecuencia (x=1), Alto volumen (y=1), Grasa baja (z=0.2)
        // C1 (Irregular): Frecuencia media (x=0.5), Volumen medio (y=0.4), Grasa media (z=0.5)
        // C2 (Alto riesgo): Baja frecuencia (x=0), Volumen bajo (y=0), Grasa alta (z=0.8)
        let centroids = [
            { x: 1.0, y: 1.0, z: 0.2 },
            { x: 0.5, y: 0.4, z: 0.5 },
            { x: 0.0, y: 0.0, z: 0.8 }
        ];

        const maxIterations = 20;
        let converged = false;
        let iterations = 0;
        let assignments = new Array(dataPoints.length).fill(-1);

        while (!converged && iterations < maxIterations) {
            iterations++;
            let changed = false;

            // 1. Asignación al centroide más cercano (Euclidiana 3D)
            dataPoints.forEach((point, idx) => {
                let minDist = Infinity;
                let closestCentroid = -1;

                centroids.forEach((c, cIdx) => {
                    const dist = Math.sqrt(
                        Math.pow(point.x - c.x, 2) +
                        Math.pow(point.y - c.y, 2) +
                        Math.pow(point.z - c.z, 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        closestCentroid = cIdx;
                    }
                });

                if (assignments[idx] !== closestCentroid) {
                    assignments[idx] = closestCentroid;
                    changed = true;
                }
            });

            if (!changed) {
                converged = true;
                break;
            }

            // 2. Recálculo de Centroides
            const newCentroids = centroids.map((c, cIdx) => {
                const assignedPoints = dataPoints.filter((p, pIdx) => assignments[pIdx] === cIdx);
                if (assignedPoints.length === 0) return c;

                const sumX = assignedPoints.reduce((sum, p) => sum + p.x, 0);
                const sumY = assignedPoints.reduce((sum, p) => sum + p.y, 0);
                const sumZ = assignedPoints.reduce((sum, p) => sum + p.z, 0);

                return {
                    x: sumX / assignedPoints.length,
                    y: sumY / assignedPoints.length,
                    z: sumZ / assignedPoints.length
                };
            });

            centroids = newCentroids;
        }

        // Ordenar clústeres lógicamente por su asistencia promedio (Freq) de forma descendente:
        // Más activo -> Comprometido
        // Intermedio -> Irregular
        // Menos activo -> Alto riesgo (Riesgo de abandono)
        const clusterStats = [0, 1, 2].map(cIdx => {
            const points = dataPoints.filter((p, pIdx) => assignments[pIdx] === cIdx);
            const avgFreq = points.length > 0
                ? points.reduce((sum, p) => sum + p.raw.frequency, 0) / points.length
                : (2 - cIdx);
            return { cIdx, avgFreq };
        });

        clusterStats.sort((a, b) => b.avgFreq - a.avgFreq);

        const labelMap = {};
        labelMap[clusterStats[0].cIdx] = "Comprometido";
        labelMap[clusterStats[1].cIdx] = "Irregular";
        labelMap[clusterStats[2].cIdx] = "Alto riesgo";

        // Guardar asignaciones finales en los perfiles
        dataPoints.forEach((point, idx) => {
            const finalCluster = labelMap[assignments[idx]];
            
            // Actualizar en el arreglo pasado como parámetro (los reales del backend si corresponde)
            const memoryUser = users.find(u => u.id === point.userId);
            if (memoryUser) memoryUser.assignedCluster = finalCluster;
            
            // Actualizar en la DB local (mock)
            const user = db.users.find(u => u.id === point.userId);
            if (user) {
                user.assignedCluster = finalCluster;
            }
            // Sincronizar el usuario activo de la SPA si corresponde
            if (point.userId === "active-user") {
                const activeProfile = localStorage.getItem('aura_user_profile');
                if (activeProfile) {
                    const activeObj = JSON.parse(activeProfile);
                    activeObj.assignedCluster = finalCluster;
                    localStorage.setItem('aura_user_profile', JSON.stringify(activeObj));
                }
            }
        });

        saveDB();
        return {
            success: true,
            iterations: iterations,
            users: users
        };
    };

    // 3. Sistema de Notificaciones Inteligentes (Lógica)
    const generateNotifications = (backendUsers) => {
        loadDB();
        const users = backendUsers || db.users;
        const logs = db.logs;
        const notifications = [];

        users.forEach(user => {
            if (user.assignedCluster === "Alto riesgo") {
                // Determinar la última rutina realizada
                const userLogs = logs.filter(l => l.userId === user.id);
                const sortedLogs = [...userLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
                const lastLog = sortedLogs[0];

                // Sugerir la rutina alterna
                let rutinaSugerida = "Tren Superior";
                if (lastLog) {
                    if (lastLog.routineName.toLowerCase().includes("superior")) {
                        rutinaSugerida = "Tren Inferior";
                    }
                }

                // Calcular inactividad
                let daysInactive = 3;
                if (user.lastWorkoutDate) {
                    const today = new Date();
                    const diffTime = Math.abs(today - new Date(user.lastWorkoutDate));
                    daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                }

                // Requerimiento de notificación específico
                const message = `Notamos que llevas ${daysInactive} días sin entrenar, tu rutina de ${rutinaSugerida} te espera con ajuste de carga de -10%.`;

                notifications.push({
                    userId: user.id,
                    userName: user.name,
                    daysInactive: daysInactive,
                    rutinaSugerida: rutinaSugerida,
                    message: message
                });
            }
        });

        return notifications;
    };

    const sugerirAjusteCarga = async (userId) => {
        loadDB();
        const userLogs = db.logs.filter(l => l.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (userLogs.length < 4) {
            return null; // Se requieren al menos el log actual y 3 anteriores
        }

        const todayVolume = userLogs[0].volume || 0;
        const previous3Logs = userLogs.slice(1, 4);
        const avgPreviousVolume = previous3Logs.reduce((sum, l) => sum + (l.volume || 0), 0) / 3;

        if (avgPreviousVolume > 0 && todayVolume >= avgPreviousVolume) { // 100% de cumplimiento
            return {
                cumplimiento: (todayVolume / avgPreviousVolume * 100).toFixed(1) + '%',
                sugerencia: 'Incremento del 5% en la carga',
                mensaje: 'Has superado o igualado tu volumen promedio. ¡Excelente trabajo! Te recomendamos subir la carga un 5%.'
            };
        }

        return {
            cumplimiento: avgPreviousVolume > 0 ? (todayVolume / avgPreviousVolume * 100).toFixed(1) + '%' : '0%',
            sugerencia: 'Mantener carga',
            mensaje: 'Continúa trabajando para consolidar este peso antes de subir.'
        };
    };

    const getAttendance = () => {
        loadDB();
        if (!db.attendance) {
            db.attendance = [];
            saveDB();
        }
        return db.attendance;
    };

    const addAttendance = (att) => {
        loadDB();
        if (!db.attendance) db.attendance = [];
        const newAtt = {
            id: `att-${Date.now()}`,
            date: new Date().toISOString(),
            ...att
        };
        db.attendance.push(newAtt);
        saveDB();
        return newAtt;
    };

    return {
        getUsers,
        addLog,
        runClustering,
        generateNotifications,
        sugerirAjusteCarga,
        loadDB,
        calculateNavySealBFP,
        getAttendance,
        addAttendance
    };
})();

// Añade esto al final de tu objeto exportado en clustering.js
const calcularTendenciaPeso = (userId, exerciseId) => {
    const logs = db.logs.filter(l => l.userId === userId);
    // Lógica para comparar el peso de los últimos 3 entrenamientos
    // Si la tendencia es positiva, sugerir incremento del 5%
    return { sugerencia: "Incremento del 5% recomendado" };
};