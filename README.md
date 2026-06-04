# ⚡ AURA Fitness - Premium Workout PWA

AURA es una **Progressive Web App (PWA)** de acondicionamiento físico de alto rendimiento, diseñada con una estética de última generación en modo ultra-dark con acentos neón (violeta/cian), inspirada en perfiles de fitness élite de Instagram como *Demicstory* y *Jongkeun Gil*. 

Ofrece una experiencia fluida, rápida y funcional **offline-first** para entrenar con el peso corporal o bandas elásticas.

---

## 🚀 Características Clave
*   **Instalación PWA Autónomo (Standalone)**: Instálala directamente en la pantalla de inicio de dispositivos iOS y Android con soporte offline completo mediante *Service Workers*.
*   **Onboarding Inteligente**: Configuración personalizada de perfil físico, objetivos (Hipertrofia, Fuerza, Resistencia) y nivel, adaptando la división y dosificación automáticamente.
*   **Distribución Balanceada de Días**: Distribución automatizada con 2 rutinas por día de entrenamiento (Día A: Tren Superior y Abdominales; Día B: Tren Inferior y Abdominales) para un trabajo completo y balanceado.
*   **Workout Player Interactivo**:
    *   Registro dinámico de series, peso y repeticiones.
    *   *Rest Timer* inteligente con barra de progreso circular que se inicia automáticamente al marcar una serie.
    *   Alertas sonoras nativas con la **Web Audio API** (sin dependencias externas de sonido).
*   **Ilustraciones Animadas CSS**: Esqueletos procedimentales dinámicos (Sentadillas, Flexiones, Press de Hombros, Glute Bridges, Fondos y Crunches) creados con transformaciones y fotogramas clave en CSS para guiar visualmente la ejecución técnica en tiempo real.
*   **Panel de Progreso**: Registro automatizado de volumen acumulativo, sets completados e historial, además de una racha activa (Streak) guardada localmente en `localStorage`.
*   **Celebración de Sesión**: Confeti dinámico renderizado de manera nativa mediante Canvas HTML5 al finalizar con éxito una rutina.

---

## 🛠️ Stack Tecnológico
*   **Frontend**: HTML5 Semántico, Vanilla CSS3 (Variables CSS, Efecto Glassmorphism, Keyframe Animations).
*   **Lógica**: Vanilla JavaScript (ES6+), Web Audio API, Canvas API.
*   **PWA**: Service Workers (`sw.js`), Web App Manifest (`manifest.json`) e iconos vectoriales SVG.

---

## 📦 Instalación Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/aura-fitness.git
   ```
2. Accede al directorio:
   ```bash
   cd aura-fitness
   ```
3. Inicia un servidor web local de tu preferencia (ej. Python):
   ```bash
   python3 -m http.server 8080
   ```
4. Abre en tu navegador la dirección `http://localhost:8080` e instálala en tu dispositivo móvil.
