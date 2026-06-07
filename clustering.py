#!/usr/bin/env python3
"""
AURA Fitness AI Engine - Python K-Means Clustering & Notification Script
========================================================================
Este script simula el motor de IA del backend, ejecutando el algoritmo
K-Means (k=3) sin dependencias externas (solo librería estándar) para
agrupar a los usuarios y generar notificaciones de recuperación.
"""

import math
import json
from datetime import datetime, timedelta

# 1. Base de datos simulada con datos sintéticos idénticos a la SPA
def get_mock_data():
    today = datetime.now()
    
    def days_ago(d):
        return (today - timedelta(days=d)).isoformat()

    users = [
        {"id": "user-1", "name": "Carlos Mendoza", "age": 28, "weight": 78.5, "height": 176, "goal": "hipertrofia", "level": "avanzado", "days": [1, 3, 5], "streak": 6, "lastWorkoutDate": days_ago(1)},
        {"id": "user-2", "name": "Laura Gómez", "age": 32, "weight": 62.0, "height": 165, "goal": "resistencia", "level": "intermedio", "days": [2, 4, 6], "streak": 4, "lastWorkoutDate": days_ago(2)},
        {"id": "user-3", "name": "Esteban Ruiz", "age": 40, "weight": 89.2, "height": 180, "goal": "fuerza", "level": "principiante", "days": [1, 4], "streak": 0, "lastWorkoutDate": days_ago(4)},
        {"id": "user-4", "name": "Daniela Rivas", "age": 24, "weight": 55.4, "height": 160, "goal": "hipertrofia", "level": "intermedio", "days": [1, 3, 5], "streak": 1, "lastWorkoutDate": days_ago(5)},
        {"id": "user-5", "name": "Javier Ortega", "age": 35, "weight": 95.0, "height": 182, "goal": "fuerza", "level": "principiante", "days": [3, 6], "streak": 0, "lastWorkoutDate": days_ago(10)},
        {"id": "user-6", "name": "Mónica Silva", "age": 29, "weight": 68.1, "height": 170, "goal": "resistencia", "level": "principiante", "days": [2, 5], "streak": 0, "lastWorkoutDate": days_ago(8)},
    ]

    logs = [
        # Carlos Mendoza (Frecuencia alta, inactividad 1 día)
        {"userId": "user-1", "date": days_ago(1), "routineName": "Tren Inferior Potencia", "duration": "45 min", "volume": 120},
        {"userId": "user-1", "date": days_ago(3), "routineName": "Tren Superior Élite", "duration": "43 min", "volume": 150},
        {"userId": "user-1", "date": days_ago(5), "routineName": "Tren Inferior Potencia", "duration": "44 min", "volume": 110},
        {"userId": "user-1", "date": days_ago(8), "routineName": "Tren Superior Élite", "duration": "45 min", "volume": 160},
        {"userId": "user-1", "date": days_ago(10), "routineName": "Tren Inferior Potencia", "duration": "100 min", "volume": 100},
        {"userId": "user-1", "date": days_ago(12), "routineName": "Tren Superior Élite", "duration": "46 min", "volume": 140},

        # Laura Gómez (Frecuencia alta, inactividad 2 días)
        {"userId": "user-2", "date": days_ago(2), "routineName": "Tren Superior Élite", "duration": "42 min", "volume": 80},
        {"userId": "user-2", "date": days_ago(4), "routineName": "Tren Inferior Potencia", "duration": "45 min", "volume": 90},
        {"userId": "user-2", "date": days_ago(7), "routineName": "Tren Superior Élite", "duration": "40 min", "volume": 75},
        {"userId": "user-2", "date": days_ago(9), "routineName": "Tren Inferior Potencia", "duration": "43 min", "volume": 85},
        {"userId": "user-2", "date": days_ago(11), "routineName": "Tren Superior Élite", "duration": "41 min", "volume": 70},

        # Esteban Ruiz (Frecuencia media, inactividad 4 días)
        {"userId": "user-3", "date": days_ago(4), "routineName": "Tren Superior Élite", "duration": "40 min", "volume": 60},
        {"userId": "user-3", "date": days_ago(9), "routineName": "Tren Inferior Potencia", "duration": "45 min", "volume": 80},

        # Daniela Rivas (Frecuencia media, inactividad 5 días)
        {"userId": "user-4", "date": days_ago(5), "routineName": "Tren Inferior Potencia", "duration": "44 min", "volume": 50},
        {"userId": "user-4", "date": days_ago(11), "routineName": "Tren Superior Élite", "duration": "42 min", "volume": 55},

        # Javier Ortega (Inactivo hace 10 días)
        {"userId": "user-5", "date": days_ago(10), "routineName": "Tren Superior Élite", "duration": "45 min", "volume": 40},

        # Mónica Silva (Inactiva hace 8 días)
        {"userId": "user-6", "date": days_ago(8), "routineName": "Tren Inferior Potencia", "duration": "43 min", "volume": 30},
    ]

    return users, logs

def run_kmeans_clustering():
    users, logs = get_mock_data()
    today = datetime.now()

    # 1. Extracción de Características
    user_features = []
    for user in users:
        user_logs = [l for l in logs if l["userId"] == user["id"]]
        
        # Frecuencia: entrenamientos en los últimos 14 días
        logs_14d = []
        for log in user_logs:
            log_date = datetime.fromisoformat(log["date"])
            if (today - log_date).days <= 14:
                logs_14d.append(log)
        frequency = len(logs_14d)

        # Inactividad: días transcurridos desde el último entrenamiento
        inactivity = 30
        if user["lastWorkoutDate"]:
            last_date = datetime.fromisoformat(user["lastWorkoutDate"])
            inactivity = (today - last_date).days

        user_features.append({
            "userId": user["id"],
            "name": user["name"],
            "frequency": frequency,
            "inactivity": inactivity
        })

    # 2. Normalización Min-Max
    freqs = [uf["frequency"] for uf in user_features]
    inacts = [uf["inactivity"] for uf in user_features]

    min_freq, max_freq = min(freqs), max(freqs)
    min_inact, max_inact = min(inacts), max(inacts)

    range_freq = (max_freq - min_freq) if (max_freq - min_freq) > 0 else 1
    range_inact = (max_inact - min_inact) if (max_inact - min_inact) > 0 else 1

    data_points = []
    for uf in user_features:
        data_points.append({
            "userId": uf["userId"],
            "name": uf["name"],
            "raw_freq": uf["frequency"],
            "raw_inact": uf["inactivity"],
            # Normalizado a [0, 1]
            "x": (uf["frequency"] - min_freq) / range_freq,
            "y": (uf["inactivity"] - min_inact) / range_inact
        })

    # 3. K-Means
    # Centroides iniciales idealizados para orientar los clusters
    centroids = [
        {"x": 1.0, "y": 0.0},  # Comprometido (alta frecuencia, baja inactividad)
        {"x": 0.5, "y": 0.3},  # Irregular
        {"x": 0.0, "y": 0.8}   # Alto riesgo (baja frecuencia, alta inactividad)
    ]

    assignments = [-1] * len(data_points)
    converged = False
    iterations = 0
    max_iterations = 20

    while not converged and iterations < max_iterations:
        iterations += 1
        changed = False

        # Asignación al más cercano
        for idx, pt in enumerate(data_points):
            min_dist = float("inf")
            closest = -1
            for c_idx, c in enumerate(centroids):
                dist = math.sqrt((pt["x"] - c["x"])**2 + (pt["y"] - c["y"])**2)
                if dist < min_dist:
                    min_dist = dist
                    closest = c_idx
            
            if assignments[idx] != closest:
                assignments[idx] = closest
                changed = True

        if not changed:
            converged = True
            break

        # Recalcular centroides
        for c_idx in range(len(centroids)):
            assigned_pts = [data_points[i] for i in range(len(data_points)) if assignments[i] == c_idx]
            if assigned_pts:
                avg_x = sum(pt["x"] for pt in assigned_pts) / len(assigned_pts)
                avg_y = sum(pt["y"] for pt in assigned_pts) / len(assigned_pts)
                centroids[c_idx] = {"x": avg_x, "y": avg_y}

    # 4. Mapeo Semántico de Clústeres basado en Inactividad Promedio
    cluster_stats = []
    for c_idx in range(3):
        pts = [data_points[i] for i in range(len(data_points)) if assignments[i] == c_idx]
        avg_inact = sum(pt["raw_inact"] for pt in pts) / len(pts) if pts else (c_idx * 10)
        cluster_stats.append({"c_idx": c_idx, "avg_inact": avg_inact})

    # Ordenar por inactividad promedio (Menor -> Comprometido, Mayor -> Alto riesgo)
    cluster_stats.sort(key=lambda x: x["avg_inact"])
    
    label_map = {
        cluster_stats[0]["c_idx"]: "Comprometido",
        cluster_stats[1]["c_idx"]: "Irregular",
        cluster_stats[2]["c_idx"]: "Alto riesgo"
    }

    # Asignar a los usuarios
    results = []
    for idx, pt in enumerate(data_points):
        cluster_name = label_map[assignments[idx]]
        results.append({
            "userId": pt["userId"],
            "name": pt["name"],
            "frequency_14d": pt["raw_freq"],
            "inactivity_days": pt["raw_inact"],
            "cluster": cluster_name
        })

    return results, label_map, centroids, iterations

def generate_notifications(results):
    users, logs = get_mock_data()
    notifications = []
    
    for r in results:
        if r["cluster"] == "Alto riesgo":
            # Obtener el último entrenamiento registrado
            user_logs = [l for l in logs if l["userId"] == r["userId"]]
            user_logs.sort(key=lambda x: x["date"], reverse=True)
            
            rutina_sugerida = "Tren Superior"
            if user_logs:
                last_log = user_logs[0]
                if "superior" in last_log["routineName"].lower():
                    rutina_sugerida = "Tren Inferior"
            
            message = (
                f"¡Hola, {r['name'].split()[0]}! Notamos que llevas {r['inactivity_days']} días sin entrenar. "
                f"Tu rutina de {rutina_sugerida} te espera hoy con un 5% menos de carga para recuperar."
            )
            notifications.append({
                "userName": r["name"],
                "message": message
            })
    return notifications

def main():
    print("=" * 60)
    print("INICIANDO MOTOR DE CLUSTERING AURA FITNESS - IA SCRIPT")
    print("=" * 60)

    results, label_map, centroids, iterations = run_kmeans_clustering()
    
    print(f"K-Means convergido con éxito en {iterations} iteraciones.")
    print("\nCentroides de los Clusters (Normalizados [0, 1]):")
    for k, v in label_map.items():
        print(f"  Cluster '{v}' -> Centroide: x={centroids[k]['x']:.4f} (Frecuencia), y={centroids[k]['y']:.4f} (Inactividad)")

    print("\nTabla de Clasificación de Usuarios:")
    print("-" * 75)
    print(f"{'Nombre':<20} | {'Entrenos (14d)':<15} | {'Días Inactivo':<15} | {'Cluster Asignado':<15}")
    print("-" * 75)
    for r in results:
        print(f"{r['name']:<20} | {r['frequency_14d']:<15} | {r['inactivity_days']:<15} | {r['cluster']:<15}")
    print("-" * 75)

    print("\nGenerando Notificaciones Automatizadas (Usuarios de 'Alto riesgo'):")
    notifications = generate_notifications(results)
    if not notifications:
        print("  No se detectaron usuarios en 'Alto riesgo'.")
    for n in notifications:
        print(f"\n  [NOTIFICACIÓN] Para: {n['userName']}")
        print(f"  Mensaje: \"{n['message']}\"")
    print("=" * 60)

if __name__ == "__main__":
    main()
