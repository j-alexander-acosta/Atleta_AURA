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

## 🏫 Ventajas de Implementación (Enfoque Universidad Católica del Norte)

AURA ha sido optimizada para resolver los desafíos operativos y deportivos de los gimnasios universitarios, con especial orientación a las necesidades de la **Universidad Católica del Norte (UCN)**:

1. **Acompañamiento Inteligente y Prevención de Deserción (Motor de IA)**:
   * **Detección Temprana**: El algoritmo de clustering (K-Means) segmenta a los usuarios por su nivel de adherencia (*Comprometidos*, *Irregulares* y *Alto Riesgo*). Esto permite identificar de forma autónoma a los estudiantes en riesgo de inactividad o deserción y desplegar campañas de motivación oportunas desde portería o vía e-mail.
2. **Seguimiento Clínico y Deportivo de Élite (Kinesiología y Lesiones)**:
   * **Bitácora Deportiva**: Módulo diseñado específicamente para el resguardo de la salud física de los **Deportistas de Selección UCN**. Permite un registro riguroso de lesiones activas, detalle clínico de diagnóstico y la bitácora de sesiones de kinesiología y rehabilitación.
3. **Eficiencia Operativa y Control de Aforo Multipropósito**:
   * **Control Integrado**: Validación ágil de ingresos en portería mediante escaneo QR dinámico por cámara web, lector de barras USB o simulación administrativa. Controla límites semanales de uso de las instalaciones, alertas médicas y vigencia de membresías para estudiantes y funcionarios.
4. **Eliminación de Fichas de Papel e Historial Deportivo**:
   * **Digitalización Total**: Reemplaza las bitácoras físicas de entrenamiento por una base de datos centralizada de rutinas y progresión de cargas accesible directamente desde el celular del atleta.
5. **Auditoría e Inteligencia de Negocios**:
   * **Reportes y Gráficos Ejecutivos**: Descarga automatizada de reportes en PDF y hojas de cálculo (CSV delimitado por `;` y compatible con Excel en español), junto con análisis gráfico dinámico (Chart.js) del flujo de asistencia y toneladas movilizadas para auditoría y toma de decisiones.

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
