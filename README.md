# ⚡ AURA Fitness - Premium Workout PWA & Cloud AI

AURA es una **Progressive Web App (PWA)** de acondicionamiento físico de alto rendimiento. Comenzó como una experiencia *offline-first* para entrenar, pero ha evolucionado hacia una robusta arquitectura Full-Stack impulsada por Inteligencia Artificial, un backend en Node.js y un completo panel de control para la administración de gimnasios y recintos deportivos.

Diseñada con una estética de última generación en modo ultra-dark con acentos neón (violeta/cian), ofrece una experiencia fluida e interactiva.

---

## 🚀 Características Clave

### Experiencia del Atleta (Frontend)
*   **Instalación PWA Autónoma**: Instálala directamente en la pantalla de inicio de dispositivos iOS y Android.
*   **Onboarding Inteligente**: Configuración personalizada de perfil físico, objetivos y métricas corporales.
*   **Workout Player Interactivo con Progresión Real**:
    *   Registro estricto de series, peso y repeticiones.
    *   **Historial Dinámico:** Indicadores visuales automáticos que muestran el *"Último peso"* levantado en cada ejercicio para promover la sobrecarga progresiva.
    *   *Rest Timer* inteligente con barra de progreso circular.
    *   Alertas sonoras nativas con Web Audio API.
*   **Notificaciones In-App**: Sistema de mensajería (banners de recuperación y advertencias) recibidas directamente desde la administración.
*   **Ilustraciones Animadas CSS**: Esqueletos procedimentales dinámicos (Sentadillas, Flexiones, Press de Hombros, etc.) creados con transformaciones y fotogramas clave en CSS puro.

### Administración y Seguridad (Backend & BD)
*   **Panel de Control Central (Control Center)**: Vista protegida por credenciales para administrar a todos los atletas del recinto.
*   **Sistema de Acceso QR Dinámico**: Generación segura de Tokens JWT con expiración de 30 segundos en formato QR, para escanear y validar el acceso físico a los gimnasios de forma infalsificable.
*   **Notificaciones por Correo Electrónico**: Integración con `Nodemailer` para despachar correos electrónicos de alerta a los atletas inactivos o de alto riesgo, enviados directamente desde el Panel de Administración.
*   **Base de Datos SQLite**: Almacenamiento persistente multi-tabla (`users`, `asistencia`, `progresion_atletas`, `notificaciones_web`, `usuarios_habilitados`).

### 🧠 Motor de Inteligencia Artificial (AURA AI)
*   **K-Means Clustering en 3D**: Algoritmo matemático que clasifica de forma automática a los usuarios en 3 Clústers (`Comprometido`, `Irregular`, `Alto Riesgo`).
*   **Análisis de Pendiente de Mejora (Sobrecarga Progresiva)**: La IA no solo evalúa cuántas veces entrena un alumno, sino que analiza matemáticamente el histórico de esfuerzo (peso y repeticiones de los últimos 3 entrenamientos) para medir la **tendencia de progreso**. Si el alumno demuestra progresión de peso, es recompensado en el clúster.
*   **Salud Física**: Cálculos integrados de Porcentaje de Grasa Corporal (Fórmula Navy Seal) e IMC para asistir en el análisis algorítmico de riesgo de la IA.

---

## 🛠️ Stack Tecnológico
*   **Frontend**: HTML5 Semántico, Vanilla CSS3 (Variables CSS, Glassmorphism), Vanilla JavaScript (ES6+), Canvas API.
*   **Backend**: Node.js, Express.js.
*   **Base de Datos**: SQLite3 (Persistencia local en archivo binario).
*   **Autenticación y Seguridad**: JSON Web Tokens (JWT) para QR dinámico, `bcrypt` para hashes de contraseñas, validación por Session Storage.
*   **Infraestructura Mail**: `Nodemailer`.

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
3. Instala las dependencias del backend:
   ```bash
   npm install
   ```
4. Inicia el servidor de Node.js:
   ```bash
   node server.js
   ```
5. Abre en tu navegador la dirección `http://localhost:3000`.

*Nota: Para el panel de administrador, puedes ingresar a `/api/admin/login`.*
