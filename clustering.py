#!/usr/bin/env python3
"""
AURA Fitness AI Engine - Python K-Means Clustering & Notification Script
========================================================================
Este script simula el motor de IA del backend, ejecutando el algoritmo
K-Means (k=3) en 3 dimensiones (Frecuencia de asistencia, Volumen acumulado
de entrenamiento y Porcentaje de grasa corporal estimado mediante la fórmula
de la Navy Seal) sin dependencias externas (solo librería estándar).
"""

import math
import json
from datetime import datetime, timedelta

# Cálculo del Porcentaje de Grasa Corporal (Navy Seal Formula)
def calculate_navy_seal_bfp(sex, height, waist, neck, hip=None):
    """
    Calcula el porcentaje de grasa corporal basándose en las circunferencias de la Navy Seal.
    Fórmula en unidades métricas (cm):
    Hombres: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    Mujeres: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    """
    try:
        if sex == "male":
            if waist <= neck:
                return 20.0  # Fallback lógico
            val = 1.0324 - 0.19077 * math.log10(waist - neck) + 0.15456 * math.log10(height)
        else:  # female
            if hip is None or hip <= 0:
                hip = waist  # Fallback si no está presente
            if (waist + hip) <= neck:
                return 25.0  # Fallback lógico
            val = 1.29579 - 0.35004 * math.log10(waist + hip - neck) + 0.22100 * math.log10(height)
        
        bfp = (495.0 / val) - 450.0
        return max(2.0, min(bfp, 50.0))  # Acotar entre 2% y 50%
    except Exception as e:
        return 22.0  # Fallback ante cualquier error de cálculo

# 1. Base de datos simulada con datos sintéticos que cumplen el nuevo esquema
def get_mock_data():
    today = datetime.now()
    
    def days_ago(d):
        return (today - timedelta(days=d)).isoformat()

    # Usuarios con datos antropométricos agregados (incluyendo cintura, cuello y cadera)
    users = [
        {
            "id": "user-1", 
            "name": "Carlos Mendoza", 
            "age": 28, 
            "sex": "male", 
            "weight": 78.5, 
            "height": 176, 
            "waist": 84.0, 
            "neck": 38.0, 
            "hip": None,
            "goal": "hipertrofia", 
            "level": "avanzado", 
            "days": [1, 3, 5], 
            "streak": 6, 
            "lastWorkoutDate": days_ago(1)
        },
        {
            "id": "user-2", 
            "name": "Laura Gómez", 
            "age": 32, 
            "sex": "female", 
            "weight": 62.0, 
            "height": 165, 
            "waist": 70.0, 
            "neck": 32.0, 
            "hip": 94.0,
            "goal": "resistencia", 
            "level": "intermedio", 
            "days": [2, 4, 6], 
            "streak": 4, 
            "lastWorkoutDate": days_ago(2)
        },
        {
            "id": "user-3", 
            "name": "Esteban Ruiz", 
            "age": 40, 
            "sex": "male", 
            "weight": 89.2, 
            "height": 180, 
            "waist": 96.0, 
            "neck": 40.0, 
            "hip": None,
            "goal": "fuerza", 
            "level": "principiante", 
            "days": [1, 4], 
            "streak": 0, 
            "lastWorkoutDate": days_ago(4)
        },
        {
            "id": "user-4", 
            "name": "Daniela Rivas", 
            "age": 24, 
            "sex": "female", 
            "weight": 55.4, 
            "height": 160, 
            "waist": 68.0, 
            "neck": 31.0, 
            "hip": 90.0,
            "goal": "hipertrofia", 
            "level": "intermedio", 
            "days": [1, 3, 5], 
            "streak": 1, 
            "lastWorkoutDate": days_ago(5)
        },
        {
            "id": "user-5", 
            "name": "Javier Ortega", 
            "age": 35, 
            "sex": "male", 
            "weight": 95.0, 
            "height": 182, 
            "waist": 104.0, 
            "neck": 41.0, 
            "hip": None,
            "goal": "fuerza", 
            "level": "principiante", 
            "days": [3, 6], 
            "streak": 0, 
            "lastWorkoutDate": days_ago(10)
        },
        {
            "id": "user-6", 
            "name": "Mónica Silva", 
            "age": 29, 
            "sex": "female", 
            "weight": 68.1, 
            "height": 170, 
            "waist": 82.0, 
            "neck": 33.0, 
            "hip": 105.0,
            "goal": "resistencia", 
            "level": "principiante", 
            "days": [2, 5], 
            "streak": 0, 
            "lastWorkoutDate": days_ago(8)
        },
    ]

    # Historial de logs con desglose de series y pesos detallados
    logs = [
        # Carlos Mendoza (Frecuencia alta, volumen alto, inactivo hace 1 día)
        {"userId": "user-1", "date": days_ago(1), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "45 min", "volume": 1200, "setsCount": 7, "sets": [{"exerciseName": "Sentadillas", "setIndex": 0, "reps": 12, "weight": 40, "completed": True}]},
        {"userId": "user-1", "date": days_ago(3), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "43 min", "volume": 1500, "setsCount": 10, "sets": [{"exerciseName": "Flexiones", "setIndex": 0, "reps": 15, "weight": 0, "completed": True}]},
        {"userId": "user-1", "date": days_ago(5), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "44 min", "volume": 1100, "setsCount": 7, "sets": []},
        {"userId": "user-1", "date": days_ago(8), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "45 min", "volume": 1600, "setsCount": 10, "sets": []},
        {"userId": "user-1", "date": days_ago(10), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "42 min", "volume": 1000, "setsCount": 7, "sets": []},
        {"userId": "user-1", "date": days_ago(12), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "46 min", "volume": 1400, "setsCount": 10, "sets": []},

        # Laura Gómez (Frecuencia alta, volumen medio, inactiva hace 2 días)
        {"userId": "user-2", "date": days_ago(2), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "42 min", "volume": 800, "setsCount": 10, "sets": []},
        {"userId": "user-2", "date": days_ago(4), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "45 min", "volume": 900, "setsCount": 7, "sets": []},
        {"userId": "user-2", "date": days_ago(7), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "40 min", "volume": 750, "setsCount": 10, "sets": []},
        {"userId": "user-2", "date": days_ago(9), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "43 min", "volume": 850, "setsCount": 7, "sets": []},
        {"userId": "user-2", "date": days_ago(11), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "41 min", "volume": 700, "setsCount": 10, "sets": []},

        # Esteban Ruiz (Frecuencia media, volumen medio-bajo, inactivo hace 4 días)
        {"userId": "user-3", "date": days_ago(4), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "40 min", "volume": 600, "setsCount": 10, "sets": []},
        {"userId": "user-3", "date": days_ago(9), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "45 min", "volume": 800, "setsCount": 7, "sets": []},

        # Daniela Rivas (Frecuencia media, volumen bajo, inactiva hace 5 días)
        {"userId": "user-4", "date": days_ago(5), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "44 min", "volume": 500, "setsCount": 7, "sets": []},
        {"userId": "user-4", "date": days_ago(11), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "42 min", "volume": 550, "setsCount": 10, "sets": []},

        # Javier Ortega (Inactivo hace 10 días, volumen muy bajo)
        {"userId": "user-5", "date": days_ago(10), "routineName": "Tren Superior Élite + Abdominales Esculpidos", "duration": "45 min", "volume": 400, "setsCount": 10, "sets": []},

        # Mónica Silva (Inactiva hace 8 días, volumen muy bajo)
        {"userId": "user-6", "date": days_ago(8), "routineName": "Tren Inferior Potencia + Abdominales Esculpidos", "duration": "43 min", "volume": 300, "setsCount": 7, "sets": []},
    ]

    return users, logs

def run_kmeans_clustering():
    users, logs = get_mock_data()
    today = datetime.now()

    # 1. Extracción de Características en 3D
    # x: Frecuencia de asistencia (últimos 14 días)
    # y: Volumen total acumulado (últimos 14 días)
    # z: Grasa Corporal calculada con la fórmula Navy Seal
    user_features = []
    for user in users:
        user_logs = [l for l in logs if l["userId"] == user["id"]]
        
        # Filtrar logs de los últimos 14 días
        logs_14d = []
        for log in user_logs:
            log_date = datetime.fromisoformat(log["date"])
            if (today - log_date).days <= 14:
                logs_14d.append(log)
        
        frequency = len(logs_14d)
        volume = sum(log.get("volume", 0) for log in logs_14d)
        
        # Porcentaje de grasa corporal
        bfp = calculate_navy_seal_bfp(
            user["sex"], 
            user["height"], 
            user["waist"], 
            user["neck"], 
            user["hip"]
        )

        user_features.append({
            "userId": user["id"],
            "name": user["name"],
            "frequency": frequency,
            "volume": volume,
            "bfp": bfp,
            "lastWorkoutDate": user["lastWorkoutDate"]
        })

    # 2. Normalización Min-Max de las 3 características
    freqs = [uf["frequency"] for uf in user_features]
    vols = [uf["volume"] for uf in user_features]
    bfps = [uf["bfp"] for uf in user_features]

    min_freq, max_freq = min(freqs), max(freqs)
    min_vol, max_vol = min(vols), max(vols)
    min_bfp, max_bfp = min(bfps), max(bfps)

    range_freq = (max_freq - min_freq) if (max_freq - min_freq) > 0 else 1
    range_vol = (max_vol - min_vol) if (max_vol - min_vol) > 0 else 1
    range_bfp = (max_bfp - min_bfp) if (max_bfp - min_bfp) > 0 else 1

    data_points = []
    for uf in user_features:
        data_points.append({
            "userId": uf["userId"],
            "name": uf["name"],
            "raw_freq": uf["frequency"],
            "raw_vol": uf["volume"],
            "raw_bfp": uf["bfp"],
            "lastWorkoutDate": uf["lastWorkoutDate"],
            # Normalizado a [0, 1]
            "x": (uf["frequency"] - min_freq) / range_freq,
            "y": (uf["volume"] - min_vol) / range_vol,
            "z": (uf["bfp"] - min_bfp) / range_bfp
        })

    # 3. Algoritmo K-Means en 3D (k = 3)
    # Centroides iniciales tridimensionales (x: Frecuencia, y: Volumen, z: Grasa Corporal)
    centroids = [
        {"x": 1.0, "y": 1.0, "z": 0.2},  # Ideal Comprometido (alta freq, alto vol, baja grasa)
        {"x": 0.5, "y": 0.4, "z": 0.5},  # Ideal Irregular
        {"x": 0.0, "y": 0.0, "z": 0.8}   # Ideal Alto Riesgo (baja freq, bajo vol, mayor grasa/inactividad)
    ]

    assignments = [-1] * len(data_points)
    converged = False
    iterations = 0
    max_iterations = 20

    while not converged and iterations < max_iterations:
        iterations += 1
        changed = False

        # Asignación al centroide más cercano (Distancia Euclidiana 3D)
        for idx, pt in enumerate(data_points):
            min_dist = float("inf")
            closest = -1
            for c_idx, c in enumerate(centroids):
                dist = math.sqrt(
                    (pt["x"] - c["x"])**2 + 
                    (pt["y"] - c["y"])**2 + 
                    (pt["z"] - c["z"])**2
                )
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
                avg_z = sum(pt["z"] for pt in assigned_pts) / len(assigned_pts)
                centroids[c_idx] = {"x": avg_x, "y": avg_y, "z": avg_z}

    # 4. Mapeo Semántico Robusto basado en la Frecuencia Promedio de Asistencia
    cluster_stats = []
    for c_idx in range(3):
        pts = [data_points[i] for i in range(len(data_points)) if assignments[i] == c_idx]
        avg_freq = sum(pt["raw_freq"] for pt in pts) / len(pts) if pts else (2 - c_idx)
        cluster_stats.append({"c_idx": c_idx, "avg_freq": avg_freq})

    # Ordenar por frecuencia promedio de asistencia descendente
    # Mayor Frecuencia -> Comprometido
    # Frecuencia Intermedia -> Irregular
    # Menor Frecuencia -> Alto riesgo (Riesgo de abandono)
    cluster_stats.sort(key=lambda x: x["avg_freq"], reverse=True)
    
    label_map = {
        cluster_stats[0]["c_idx"]: "Comprometido",
        cluster_stats[1]["c_idx"]: "Irregular",
        cluster_stats[2]["c_idx"]: "Alto riesgo"
    }

    # Asignar clúster final
    results = []
    for idx, pt in enumerate(data_points):
        cluster_name = label_map[assignments[idx]]
        results.append({
            "userId": pt["userId"],
            "name": pt["name"],
            "frequency_14d": pt["raw_freq"],
            "volume_14d": pt["raw_vol"],
            "body_fat_pct": pt["raw_bfp"],
            "lastWorkoutDate": pt["lastWorkoutDate"],
            "cluster": cluster_name
        })

    return results, label_map, centroids, iterations

def generate_notifications(results):
    users, logs = get_mock_data()
    notifications = []
    today = datetime.now()
    
    for r in results:
        if r["cluster"] == "Alto riesgo":
            # Calcular inactividad
            days_inactive = 3
            if r["lastWorkoutDate"]:
                last_date = datetime.fromisoformat(r["lastWorkoutDate"])
                days_inactive = (today - last_date).days

            # Obtener el último entrenamiento registrado
            user_logs = [l for l in logs if l["userId"] == r["userId"]]
            user_logs.sort(key=lambda x: x["date"], reverse=True)
            
            # Alternar rutina sugerida
            rutina_sugerida = "Tren Superior"
            if user_logs:
                last_log = user_logs[0]
                if "superior" in last_log["routineName"].lower():
                    rutina_sugerida = "Tren Inferior"
            
            # Mensaje personalizado de ajuste de carga
            message = (
                f"Notamos que llevas {days_inactive} días sin entrenar, tu rutina de "
                f"{rutina_sugerida} te espera con ajuste de carga de -10%."
            )
            notifications.append({
                "userName": r["name"],
                "message": message
            })
    return notifications

def main():
    print("=" * 75)
    print("INICIANDO MOTOR DE CLUSTERING AURA FITNESS - IA SCRIPT EN 3D (PYTHON)")
    print("=" * 75)

    results, label_map, centroids, iterations = run_kmeans_clustering()
    
    print(f"K-Means (K=3) convergido con éxito en {iterations} iteraciones.")
    print("\nCentroides de los Clusters (Normalizados [0, 1]):")
    for k, v in label_map.items():
        print(f"  Cluster '{v:<12}' -> Centroide: x={centroids[k]['x']:.4f} (Asistencia), y={centroids[k]['y']:.4f} (Volumen), z={centroids[k]['z']:.4f} (Grasa Corp.)")

    print("\nTabla de Clasificación de Usuarios:")
    print("-" * 90)
    print(f"{'Nombre':<18} | {'Entrenos (14d)':<15} | {'Volumen (14d)':<15} | {'Grasa % (Seal)':<15} | {'Cluster Asignado':<15}")
    print("-" * 90)
    for r in results:
        print(f"{r['name']:<18} | {r['frequency_14d']:<15} | {r['volume_14d']:<15} | {r['body_fat_pct']:<15.1f}% | {r['cluster']:<15}")
    print("-" * 90)

    print("\nGenerando Notificaciones Automatizadas (Usuarios de 'Alto riesgo' / Riesgo de Abandono):")
    notifications = generate_notifications(results)
    if not notifications:
        print("  No se detectaron usuarios en 'Alto riesgo'.")
    for n in notifications:
        print(f"\n  [ALERTA AUTOMÁTICA] Destinatario: {n['userName']}")
        print(f"  Mensaje enviado: \"{n['message']}\"")
    print("=" * 75)

if __name__ == "__main__":
    main()
