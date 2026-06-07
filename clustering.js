/* ==========================================================================
   AURA FITNESS AI MOTOR - CLUSTERING & NOTIFICATIONS
   ========================================================================== */

const AURA_AI = (() => {
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
                weight: 78.5,
                height: 176,
                goal: "hipertrofia",
                level: "avanzado",
                days: [1, 3, 5], // Lun, Mié, Vie
                streak: 6,
                lastWorkoutDate: daysAgo(1),
                assignedCluster: "Comprometido"
            },
            {
                id: "user-2",
                name: "Laura Gómez",
                age: 32,
                weight: 62.0,
                height: 165,
                goal: "resistencia",
                level: "intermedio",
                days: [2, 4, 6], // Mar, Jue, Sáb
                streak: 4,
                lastWorkoutDate: daysAgo(2),
                assignedCluster: "Comprometido"
            },
            {
                id: "user-3",
                name: "Esteban Ruiz",
                age: 40,
                weight: 89.2,
                height: 180,
                goal: "fuerza",
                level: "principiante",
                days: [1, 4], // Lun, Jue
                streak: 0,
                lastWorkoutDate: daysAgo(4),
                assignedCluster: "Irregular"
            },
            {
                id: "user-4",
                name: "Daniela Rivas",
                age: 24,
                weight: 55.4,
                height: 160,
                goal: "hipertrofia",
                level: "intermedio",
                days: [1, 3, 5], // Lun, Mié, Vie
                streak: 1,
                lastWorkoutDate: daysAgo(5),
                assignedCluster: "Irregular"
            },
            {
                id: "user-5",
                name: "Javier Ortega",
                age: 35,
                weight: 95.0,
                height: 182,
                goal: "fuerza",
                level: "principiante",
                days: [3, 6], // Mié, Sáb
                streak: 0,
                lastWorkoutDate: daysAgo(10),
                assignedCluster: "Alto riesgo"
            },
            {
                id: "user-6",
                name: "Mónica Silva",
                age: 29,
                weight: 68.1,
                height: 170,
                goal: "resistencia",
                level: "principiante",
                days: [2, 5], // Mar, Vie
                streak: 0,
                lastWorkoutDate: daysAgo(8),
                assignedCluster: "Alto riesgo"
            }
        ];

        // Logs de entrenamiento históricos realistas de los últimos 14 días
        const mockLogs = [
            // Carlos Mendoza (Muy activo)
            { id: "log-1", userId: "user-1", date: daysAgo(1), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "45 min", volume: 120, setsCount: 7 },
            { id: "log-2", userId: "user-1", date: daysAgo(3), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "43 min", volume: 150, setsCount: 10 },
            { id: "log-3", userId: "user-1", date: daysAgo(5), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "44 min", volume: 110, setsCount: 7 },
            { id: "log-4", userId: "user-1", date: daysAgo(8), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "45 min", volume: 160, setsCount: 10 },
            { id: "log-5", userId: "user-1", date: daysAgo(10), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "42 min", volume: 100, setsCount: 7 },
            { id: "log-6", userId: "user-1", date: daysAgo(12), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "46 min", volume: 140, setsCount: 10 },

            // Laura Gómez (Activa)
            { id: "log-7", userId: "user-2", date: daysAgo(2), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "42 min", volume: 80, setsCount: 10 },
            { id: "log-8", userId: "user-2", date: daysAgo(4), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "45 min", volume: 90, setsCount: 7 },
            { id: "log-9", userId: "user-2", date: daysAgo(7), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "40 min", volume: 75, setsCount: 10 },
            { id: "log-10", userId: "user-2", date: daysAgo(9), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "43 min", volume: 85, setsCount: 7 },
            { id: "log-11", userId: "user-2", date: daysAgo(11), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "41 min", volume: 70, setsCount: 10 },

            // Esteban Ruiz (Irregular - empezó a fallar)
            { id: "log-12", userId: "user-3", date: daysAgo(4), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "40 min", volume: 60, setsCount: 10 },
            { id: "log-13", userId: "user-3", date: daysAgo(9), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "45 min", volume: 80, setsCount: 7 },

            // Daniela Rivas (Irregular - falló recientemente)
            { id: "log-14", userId: "user-4", date: daysAgo(5), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "44 min", volume: 50, setsCount: 7 },
            { id: "log-15", userId: "user-4", date: daysAgo(11), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "42 min", volume: 55, setsCount: 10 },

            // Javier Ortega (Alto Riesgo - Inactivo hace 10 días)
            { id: "log-16", userId: "user-5", date: daysAgo(10), routineName: "Tren Superior Élite + Abdominales Esculpidos", duration: "45 min", volume: 40, setsCount: 10 },

            // Mónica Silva (Alto Riesgo - Inactiva hace 8 días)
            { id: "log-17", userId: "user-6", date: daysAgo(8), routineName: "Tren Inferior Potencia + Abdominales Esculpidos", duration: "43 min", volume: 30, setsCount: 7 }
        ];

        return { users: mockUsers, logs: mockLogs };
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
            const idx = db.users.findIndex(u => u.id === "active-user" || u.name === userObj.name);
            const userRecord = {
                id: "active-user",
                name: userObj.name + " (Tú)",
                age: userObj.age,
                weight: userObj.weight,
                height: userObj.height,
                goal: userObj.goal,
                level: userObj.level,
                days: userObj.days,
                streak: userObj.streak,
                lastWorkoutDate: userObj.lastWorkoutDate,
                assignedCluster: userObj.assignedCluster || "Pendiente"
            };

            if (idx !== -1) {
                // Actualizar
                db.users[idx] = { ...db.users[idx], ...userRecord };
            } else {
                // Agregar
                db.users.push(userRecord);
            }

            // Sincronizar logs del usuario activo
            // Limpiar logs anteriores de 'active-user'
            db.logs = db.logs.filter(l => l.userId !== "active-user");
            userLogs.forEach((l, i) => {
                db.logs.push({
                    id: `active-log-${i}`,
                    userId: "active-user",
                    date: l.date,
                    routineName: l.routineName,
                    duration: l.duration,
                    volume: l.volume,
                    setsCount: l.setsCount
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

    // 2. Algoritmo K-Means para Clustering de Usuarios
    const runClustering = () => {
        loadDB();
        const users = getUsers(); // Asegurar sincronización
        const logs = db.logs;
        const today = new Date();

        // Calcular características para cada usuario
        const userFeatures = users.map(user => {
            const userLogs = logs.filter(l => l.userId === user.id);
            
            // Frecuencia: Entrenamientos en los últimos 14 días
            const logsLast14Days = userLogs.filter(l => {
                const diffTime = Math.abs(today - new Date(l.date));
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return diffDays <= 14;
            });
            const frequency = logsLast14Days.length;

            // Inactividad: Días desde el último entrenamiento
            let inactivity = 30; // Valor máximo si no ha entrenado nunca
            if (user.lastWorkoutDate) {
                const diffTime = Math.abs(today - new Date(user.lastWorkoutDate));
                inactivity = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }

            return {
                userId: user.id,
                name: user.name,
                rawFeatures: { frequency, inactivity }
            };
        });

        // Normalización Min-Max de Características para K-Means
        const freqs = userFeatures.map(f => f.rawFeatures.frequency);
        const inacts = userFeatures.map(f => f.rawFeatures.inactivity);

        const minFreq = Math.min(...freqs);
        const maxFreq = Math.max(...freqs);
        const minInact = Math.min(...inacts);
        const maxInact = Math.max(...inacts);

        const rangeFreq = maxFreq - minFreq || 1;
        const rangeInact = maxInact - minInact || 1;

        const dataPoints = userFeatures.map(uf => {
            return {
                userId: uf.userId,
                name: uf.name,
                raw: uf.rawFeatures,
                // Normalizado a [0, 1]
                x: (uf.rawFeatures.frequency - minFreq) / rangeFreq,   // Frecuencia
                y: (uf.rawFeatures.inactivity - minInact) / rangeInact  // Inactividad
            };
        });

        // Inicialización de 3 centroides
        // Forzamos centroides lógicos iniciales para orientar la clasificación:
        // C0 (Comprometido): Alta frecuencia (x=1), Baja inactividad (y=0)
        // C1 (Irregular): Frecuencia media (x=0.5), Inactividad media (y=0.2)
        // C2 (Alto riesgo): Baja frecuencia (x=0), Alta inactividad (y=1)
        let centroids = [
            { x: 1.0, y: 0.0 }, // Ideal Comprometido
            { x: 0.5, y: 0.3 }, // Ideal Irregular
            { x: 0.0, y: 0.8 }  // Ideal Alto Riesgo
        ];

        const maxIterations = 20;
        let converged = false;
        let iterations = 0;
        let assignments = new Array(dataPoints.length).fill(-1);

        while (!converged && iterations < maxIterations) {
            iterations++;
            let changed = false;

            // 1. Asignación al centroide más cercano
            dataPoints.forEach((point, idx) => {
                let minDist = Infinity;
                let closestCentroid = -1;

                centroids.forEach((c, cIdx) => {
                    // Distancia Euclidiana
                    const dist = Math.sqrt(Math.pow(point.x - c.x, 2) + Math.pow(point.y - c.y, 2));
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
                if (assignedPoints.length === 0) return c; // Mantener igual si no hay puntos asignados

                const sumX = assignedPoints.reduce((sum, p) => sum + p.x, 0);
                const sumY = assignedPoints.reduce((sum, p) => sum + p.y, 0);

                return {
                    x: sumX / assignedPoints.length,
                    y: sumY / assignedPoints.length
                };
            });

            centroids = newCentroids;
        }

        // Para evitar problemas de inicialización aleatoria de etiquetas, 
        // mapeamos los clusters basados en sus promedios de inactividad de forma definitiva:
        // Cluster con menor inactividad promedio -> "Comprometido"
        // Cluster con inactividad promedio intermedia -> "Irregular"
        // Cluster con mayor inactividad promedio -> "Alto riesgo"
        const clusterStats = [0, 1, 2].map(cIdx => {
            const points = dataPoints.filter((p, pIdx) => assignments[pIdx] === cIdx);
            const avgInactivity = points.length > 0 
                ? points.reduce((sum, p) => sum + p.raw.inactivity, 0) / points.length 
                : (cIdx === 0 ? 0 : (cIdx === 1 ? 5 : 15)); // Valores por defecto de orden
            return { cIdx, avgInactivity };
        });

        // Ordenar por inactividad promedio ascendente
        clusterStats.sort((a, b) => a.avgInactivity - b.avgInactivity);

        const labelMap = {};
        labelMap[clusterStats[0].cIdx] = "Comprometido";
        labelMap[clusterStats[1].cIdx] = "Irregular";
        labelMap[clusterStats[2].cIdx] = "Alto riesgo";

        // Guardar asignaciones finales en los perfiles
        dataPoints.forEach((point, idx) => {
            const user = db.users.find(u => u.id === point.userId);
            const finalCluster = labelMap[assignments[idx]];
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
            users: db.users
        };
    };

    // 3. Sistema de Notificaciones Inteligentes (Lógica)
    const generateNotifications = () => {
        loadDB();
        const users = db.users;
        const logs = db.logs;
        const notifications = [];

        users.forEach(user => {
            if (user.assignedCluster === "Alto riesgo") {
                // Determinar la última rutina realizada
                const userLogs = logs.filter(l => l.userId === user.id);
                // Ordenar logs por fecha descendente
                const sortedLogs = [...userLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
                const lastLog = sortedLogs[0];
                
                // Sugerir la rutina alterna
                let rutinaSugerida = "Tren Superior"; // Por defecto
                if (lastLog) {
                    if (lastLog.routineName.toLowerCase().includes("superior")) {
                        rutinaSugerida = "Tren Inferior";
                    }
                }

                // Calcular inactividad
                let daysInactive = 3; // Valor por defecto
                if (user.lastWorkoutDate) {
                    const today = new Date();
                    const diffTime = Math.abs(today - new Date(user.lastWorkoutDate));
                    daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                }

                const message = `¡Hola, ${user.name.split(" ")[0]}! Notamos que llevas ${daysInactive} días sin entrenar. Tu rutina de ${rutinaSugerida} te espera hoy con un 5% menos de carga para recuperar.`;
                
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

    return {
        getUsers,
        addLog,
        runClustering,
        generateNotifications,
        loadDB
    };
})();
