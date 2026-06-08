/* ==========================================================================
   AURA FITNESS BUSINESS LOGIC - APP.JS
   ========================================================================== */

// 1. Catálogo Completo de Ejercicios y Rutinas (Basados en las imágenes)
const WORKOUT_DATABASE = {
    // Día A: Tren Superior (Upper Body) - Pecho y Hombros (2 Grupos Musculares)
    upper: {
        name: "Tren Superior Élite",
        duration: "30 min",
        exercises: [
            {
                name: "Movilidad Articular Torso",
                muscle: "Hombros (Movilidad)",
                animationClass: "press-animation",
                videoUrl: "https://www.youtube.com/embed/FD31v3S23-s",
                instructions: [
                    "Párate con pies firmes y realiza rotaciones lentas de hombros.",
                    "Lleva tus brazos estirados hacia los lados dibujando círculos pequeños.",
                    "Abre el pecho estirando una banda elástica de baja resistencia frente a ti (Fila 2, Columna 1-2)."
                ],
                sets: [
                    { reps: 10, weight: 0 },
                    { reps: 10, weight: 0 }
                ]
            },
            {
                name: "Flexiones de Brazos Estándar",
                muscle: "Pecho (Chest)",
                animationClass: "pushup-animation",
                videoUrl: "https://www.youtube.com/embed/4y0i5Kz0qf4",
                instructions: [
                    "Coloca las manos en el suelo, separadas un poco más que el ancho de hombros (Imagen 2).",
                    "Cuerpo alineado en línea recta desde los hombros hasta los talones.",
                    "Fase Excéntrica: Baja el pecho doblando los codos hacia atrás en ángulo de 45 grados (3 seg).",
                    "Fase Concéntrica: Empuja con fuerza contrayendo el pecho hasta extender los brazos (1 seg)."
                ],
                sets: [
                    { reps: 12, weight: 0 },
                    { reps: 10, weight: 0 },
                    { reps: 10, weight: 0 },
                    { reps: 8, weight: 0 }
                ]
            },
            {
                name: "Flexiones Inclinadas en Silla",
                muscle: "Pecho (Chest)",
                animationClass: "pushup-animation",
                videoUrl: "https://www.youtube.com/embed/6B928R2g060",
                instructions: [
                    "Apoya las manos firmemente en el borde de una silla o banco estable (Imagen 2 - Variante).",
                    "Step back para alinear el torso y las piernas formando una pendiente diagonal.",
                    "Fase Excéntrica: Baja el torso controladamente hasta rozar la silla con el esternón (3 seg).",
                    "Fase Concéntrica: Empuja con fuerza enfocando el esfuerzo en la zona inferior del pectoral (1 seg)."
                ],
                sets: [
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 },
                    { reps: 10, weight: 0 }
                ]
            },
            {
                name: "Apertura de Pecho con Banda",
                muscle: "Pecho (Chest)",
                animationClass: "press-animation",
                videoUrl: "https://www.youtube.com/embed/cM8lB46b3J0",
                instructions: [
                    "Ancla la banda detrás de tu espalda a la altura de las escápulas (Imagen 3 - Fila 5, Columna 2).",
                    "Extiende los brazos hacia adelante manteniendo una ligera flexión en los codos.",
                    "Junta las manos al frente de tu cuerpo contrayendo el pecho en la parte concéntrica.",
                    "Regresa de forma lenta y controlada abriendo los brazos (3 seg)."
                ],
                sets: [
                    { reps: 15, weight: 0 },
                    { reps: 15, weight: 0 },
                    { reps: 12, weight: 0 }
                ]
            },
            {
                name: "Press de Hombros Sentado con Banda",
                muscle: "Hombros (Shoulders)",
                animationClass: "press-animation",
                videoUrl: "https://www.youtube.com/embed/_yC_1gP3nO4",
                instructions: [
                    "Siéntate erguido sobre una silla pisando la banda elástica (Imagen 3 - Fila 5, Columna 3).",
                    "Sostén los agarres a la altura de tus orejas con las palmas hacia adelante.",
                    "Fase Concéntrica: Empuja la banda hacia arriba sobre tu cabeza hasta estirar los brazos (1 seg).",
                    "Fase Excéntrica: Baja la banda lentamente resistiendo la tensión hasta la barbilla (2.5 seg)."
                ],
                sets: [
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 },
                    { reps: 10, weight: 0 }
                ]
            },
            {
                name: "Elevaciones Laterales con Banda",
                muscle: "Hombros (Shoulders)",
                animationClass: "press-animation",
                videoUrl: "https://www.youtube.com/embed/g62x_tW4q-E",
                instructions: [
                    "De pie, pisa el centro de la banda con un pie (Imagen 3 - Fila 4, Columna 2).",
                    "Sujeta los extremos de la banda con los brazos extendidos a los costados.",
                    "Fase Concéntrica: Eleva los brazos lateralmente hasta la altura de los hombros (1 seg).",
                    "Fase Excéntrica: Baja los brazos lentamente controlando la tensión (2.5 seg)."
                ],
                sets: [
                    { reps: 15, weight: 0 },
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 }
                ]
            },
            {
                name: "Fondos en Silla (Dips)",
                muscle: "Hombros (Shoulders)",
                animationClass: "dips-animation",
                videoUrl: "https://www.youtube.com/embed/642-qS9q_tU",
                instructions: [
                    "Apoya las palmas en el borde del banco, pies al frente (Imagen 2 - Fondos/Dips).",
                    "Desciende la cadera de forma vertical doblando los codos.",
                    "Mantén la espalda pegada al banco.",
                    "Empuja de vuelta extendiendo los brazos con la fuerza del tríceps y deltoide anterior."
                ],
                sets: [
                    { reps: 12, weight: 0 },
                    { reps: 10, weight: 0 },
                    { reps: 10, weight: 0 }
                ]
            }
        ]
    },
    // Día B: Tren Inferior (Lower Body) - Piernas
    lower: {
        name: "Tren Inferior Potencia",
        duration: "30 min",
        exercises: [
            {
                name: "Movilidad Cadera y Tobillo",
                muscle: "Piernas (Movilidad)",
                animationClass: "bridge-animation",
                videoUrl: "https://www.youtube.com/embed/Aq_Ohf4MhNU",
                instructions: [
                    "Realiza sentadillas profundas sin carga sujetándote de un soporte (Imagen 4).",
                    "Haz estocadas laterales alternas lentas para activar aductores (Fila 3, Columna 1).",
                    "Realiza flexiones y giros dinámicos de tobillo de pie."
                ],
                sets: [
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 }
                ]
            },
            {
                name: "Sentadilla Peso Corporal",
                muscle: "Piernas (Cuádriceps/Glúteos)",
                animationClass: "squat-animation",
                videoUrl: "https://www.youtube.com/embed/W7oK3saC52g",
                instructions: [
                    "Pies al ancho de hombros, puntas ligeramente hacia afuera (Imagen 2).",
                    "Fase Excéntrica: Baja la cadera empujándola hacia atrás como sentándote (3 seg).",
                    "Mantén la rodilla alineada en la dirección del pie sin colapsar.",
                    "Fase Concéntrica: Empuja con fuerza desde los talones para recuperar la verticalidad (1 seg)."
                ],
                sets: [
                    { reps: 15, weight: 0 },
                    { reps: 15, weight: 0 },
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 }
                ]
            },
            {
                name: "Estocadas Alternadas (Lunges)",
                muscle: "Piernas (Cuádriceps/Glúteos)",
                animationClass: "squat-animation",
                videoUrl: "https://www.youtube.com/embed/Ry-wqegeKlE",
                instructions: [
                    "Da un paso largo hacia adelante manteniendo la espalda recta (Imagen 2).",
                    "Fase Excéntrica: Desciende ambas rodillas hasta que la trasera roce el suelo.",
                    "La rodilla delantera debe formar un ángulo de 90 grados y estar alineada con el pie.",
                    "Fase Concéntrica: Empuja fuerte con la pierna delantera para regresar (1 seg)."
                ],
                sets: [
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 },
                    { reps: 10, weight: 0 }
                ]
            },
            {
                name: "Puente de Glúteos con Banda",
                muscle: "Piernas (Cuádriceps/Glúteos)",
                animationClass: "bridge-animation",
                videoUrl: "https://www.youtube.com/embed/7uS-f49R71M",
                instructions: [
                    "Acuéstate boca arriba, rodillas dobladas, pies apoyados en el suelo (Imagen 5 - Fila 1, Columna 3).",
                    "Coloca una banda elástica arriba de tus rodillas.",
                    "Fase Concéntrica: Eleva la pelvis apretando los glúteos y empujando las rodillas hacia afuera.",
                    "Fase Excéntrica: Baja la pelvis lentamente sin apoyar completamente los glúteos (2.5 seg)."
                ],
                sets: [
                    { reps: 15, weight: 0 },
                    { reps: 15, weight: 0 },
                    { reps: 15, weight: 0 }
                ]
            }
        ]
    },
    // Rutina C: Abdominales y Core
    core: {
        name: "Abdominales Esculpidos",
        duration: "15 min",
        exercises: [
            {
                name: "Crunch Abdominal",
                muscle: "Abdomen (Core)",
                animationClass: "crunch-animation",
                videoUrl: "https://www.youtube.com/embed/X-M8Ww6H0y4",
                instructions: [
                    "Boca arriba, rodillas flexionadas y pies planos (Imagen 2).",
                    "Cruza las manos al pecho o apóyalas suavemente en las sienes.",
                    "Fase Concéntrica: Eleva los hombros y escápulas contrayendo el abdomen al exhalar.",
                    "Mantén la zona lumbar apoyada firmemente en el suelo."
                ],
                sets: [
                    { reps: 20, weight: 0 },
                    { reps: 15, weight: 0 },
                    { reps: 15, weight: 0 }
                ]
            },
            {
                name: "Elevación de Piernas en Suelo",
                muscle: "Abdomen (Core)",
                animationClass: "crunch-animation",
                videoUrl: "https://www.youtube.com/embed/fE9f_3R_a1E",
                instructions: [
                    "Boca arriba en el suelo, con las manos debajo de los glúteos para soporte lumbar (Imagen 5 - Fila 5, Columna 1).",
                    "Mantén las piernas rectas juntas.",
                    "Fase Concéntrica: Eleva las piernas verticalmente hasta formar un ángulo de 90 grados.",
                    "Fase Excéntrica: Baja las piernas de forma controlada hasta que estén cerca del suelo (3 seg)."
                ],
                sets: [
                    { reps: 15, weight: 0 },
                    { reps: 12, weight: 0 },
                    { reps: 12, weight: 0 }
                ]
            },
            {
                name: "Plancha Abdominal Estática (Plank)",
                muscle: "Abdomen (Core)",
                animationClass: "pushup-animation",
                videoUrl: "https://www.youtube.com/embed/p1L6oW3d7b8",
                instructions: [
                    "Apoya los antebrazos y las puntas de los pies en el suelo (Imagen 5 - Fila 1, Columna 1).",
                    "Los codos deben quedar alineados directamente debajo de los hombros.",
                    "Mantén el abdomen y glúteos fuertemente contraídos, cuerpo en línea recta.",
                    "Sostén la posición de forma inmóvil respirando controladamente."
                ],
                sets: [
                    { reps: 30, weight: 0 },
                    { reps: 30, weight: 0 },
                    { reps: 30, weight: 0 }
                ]
            }
        ]
    }
};

// 2. Estado Global de la Aplicación
let AppState = {
    user: null, // Guardado en localStorage
    history: [], // Historial de entrenamientos
    currentWorkout: null,
    workoutActive: false,
    activeExerciseIndex: 0,
    workoutTimerInterval: null,
    workoutStartTime: null,
    workoutSecondsElapsed: 0,
    restTimerInterval: null,
    restSecondsRemaining: 0,
    restTotalDuration: 90, // Segundos de descanso por defecto
    manualWorkoutSelection: 'auto' // 'auto', 'upper', 'lower'
};

// Elementos del DOM
const DOM = {
    screenOnboarding: document.getElementById('screen-onboarding'),
    screenMainLayout: document.getElementById('main-layout'),
    screenActiveWorkout: document.getElementById('screen-workout-active'),
    screenSummary: document.getElementById('screen-workout-summary'),
    
    // Onboarding Steps
    onboardingStep1: document.getElementById('onboarding-step-1'),
    onboardingStep2: document.getElementById('onboarding-step-2'),
    onboardingStep3: document.getElementById('onboarding-step-3'),
    onboardingStep4: document.getElementById('onboarding-step-4'),
    
    // Onboarding Buttons
    btnOnboardingStart: document.getElementById('btn-onboarding-start'),
    btnOnboardingTo3: document.getElementById('btn-onboarding-to-3'),
    btnOnboardingTo4: document.getElementById('btn-onboarding-to-4'),
    btnOnboardingFinalize: document.getElementById('btn-onboarding-finalize'),
    btnOnboardingBackTo2: document.getElementById('btn-onboarding-back-to-2'),
    btnOnboardingBackTo3: document.getElementById('btn-onboarding-back-to-3'),
    
    // Onboarding Inputs
    inputName: document.getElementById('input-name'),
    inputAge: document.getElementById('input-age'),
    inputWeight: document.getElementById('input-weight'),
    inputHeight: document.getElementById('input-height'),
    btnGoalOptions: document.querySelectorAll('.card-select-option'),
    btnLevelOptions: document.querySelectorAll('.segment-btn'),
    btnDayOptions: document.querySelectorAll('.day-btn'),
    routinePreviewBox: document.getElementById('routine-preview-box'),
    routineDistributionDesc: document.getElementById('routine-distribution-desc'),
    
    // Main Tabs Nav & Panels
    navItems: document.querySelectorAll('.nav-item'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    
    // Dashboard Elements
    userGreeting: document.getElementById('user-greeting'),
    avatarInitials: document.getElementById('avatar-initials'),
    statStreak: document.getElementById('stat-streak'),
    statCompletion: document.getElementById('stat-completion'),
    weeklyDaysDots: document.getElementById('weekly-days-dots'),
    todayWorkoutTitle: document.getElementById('today-workout-title'),
    todayWorkoutDetails: document.getElementById('today-workout-details'),
    todayWorkoutTag: document.getElementById('today-workout-tag'),
    btnStartWorkout: document.getElementById('btn-start-workout'),
    
    // Routines Tab
    routinesContainer: document.getElementById('routines-container'),
    
    // Profile Tab
    profileInitials: document.getElementById('profile-initials'),
    profileName: document.getElementById('profile-name'),
    profileStatsSummary: document.getElementById('profile-stats-summary'),
    profileTotalWorkouts: document.getElementById('profile-total-workouts'),
    profileTotalSets: document.getElementById('profile-total-sets'),
    historyItemsContainer: document.getElementById('history-items-container'),
    btnResetData: document.getElementById('btn-reset-data'),
    
    // Active Workout Screen
    activeWorkoutName: document.getElementById('active-workout-name'),
    activeWorkoutTimer: document.getElementById('active-workout-timer'),
    activeWorkoutIndex: document.getElementById('active-workout-index'),
    exerciseTargetMuscle: document.getElementById('exercise-target-muscle'),
    exerciseIllustration: document.getElementById('exercise-illustration'),
    exerciseActiveName: document.getElementById('exercise-active-name'),
    exerciseInstructionsList: document.getElementById('exercise-instructions-list'),
    setsRowsContainer: document.getElementById('sets-rows-container'),
    btnWorkoutQuit: document.getElementById('btn-workout-quit'),
    btnPrevExercise: document.getElementById('btn-prev-exercise'),
    btnNextExercise: document.getElementById('btn-next-exercise'),
    btnExerciseVideo: document.getElementById('btn-exercise-video'),
    
    // Rest Timer Panel
    restTimerOverlay: document.getElementById('rest-timer-overlay'),
    restTimerCountdown: document.getElementById('rest-timer-countdown'),
    btnRestAdd30: document.getElementById('btn-rest-add-30'),
    btnRestSkip: document.getElementById('btn-rest-skip'),
    
    // Summary Screen
    summaryConfetti: document.getElementById('summary-confetti'),
    summaryDuration: document.getElementById('summary-stat-duration'),
    summaryVolume: document.getElementById('summary-stat-volume'),
    summarySets: document.getElementById('summary-stat-sets'),
    summaryBadgeText: document.getElementById('summary-badge-text'),
    btnSummaryDone: document.getElementById('btn-summary-done'),
    
    // Video Modal
    videoModal: document.getElementById('video-modal'),
    videoModalTitle: document.getElementById('video-modal-title'),
    videoIframePlaceholder: document.getElementById('video-iframe-placeholder'),
    btnVideoModalClose: document.getElementById('btn-video-modal-close'),
    videoModalCloseOverlay: document.getElementById('video-modal-close-overlay'),

    // Selector Manual de Rutinas
    btnSelectAuto: document.getElementById('btn-select-auto'),
    btnSelectUpper: document.getElementById('btn-select-upper'),
    btnSelectLower: document.getElementById('btn-select-lower'),

    // Panel de Administrador
    btnRunClustering: document.getElementById('btn-run-clustering'),
    adminAiIterations: document.getElementById('admin-ai-iterations'),
    adminCountCommitted: document.getElementById('admin-count-committed'),
    adminCountIrregular: document.getElementById('admin-count-irregular'),
    adminCountHighrisk: document.getElementById('admin-count-highrisk'),
    adminUsersTableBody: document.getElementById('admin-users-table-body'),
    adminNotificationsContainer: document.getElementById('admin-notifications-container'),
    adminFilterCluster: document.getElementById('admin-filter-cluster'),

    // IMC & BFP Preview
    imcPreviewBox: document.getElementById('imc-preview-box'),
    imcValue: document.getElementById('imc-value'),
    bfpValue: document.getElementById('bfp-value'),
    imcBadge: document.getElementById('imc-badge'),
    imcDesc: document.getElementById('imc-desc'),

    // Antropometría
    genderControl: document.getElementById('gender-control'),
    inputWaist: document.getElementById('input-waist'),
    inputNeck: document.getElementById('input-neck'),
    inputHip: document.getElementById('input-hip'),
    groupHip: document.getElementById('group-hip'),

    // Modal de Confirmación
    confirmModal: document.getElementById('confirm-modal'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmAccept: document.getElementById('btn-confirm-accept'),
    confirmModalOverlay: document.getElementById('confirm-modal-overlay')
};

// Variables temporales para el onboarding
let tempProfile = {
    name: '',
    age: 0,
    sex: 'male',
    weight: 0,
    height: 0,
    waist: 0,
    neck: 0,
    hip: 0,
    goal: 'hipertrofia',
    level: 'principiante',
    days: [], // Lunes = 1, Domingo = 0
    imc: 0,
    bodyFat: 0
};

/* ==========================================================================
   Inicialización y Carga de Estado
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    
    // Inicializar base de datos de IA
    try {
        AURA_AI.loadDB();
        if (AppState.user) {
            AURA_AI.getUsers(); // Sincroniza perfil activo
        }
    } catch (err) {
        console.error("Error al inicializar AURA_AI:", err);
    }
    
    initEventListeners();
    
    if (AppState.user) {
        showScreen('main-layout');
        renderDashboard();
        renderRoutinesTab();
        renderProfileTab();
    } else {
        showScreen('screen-onboarding');
        showOnboardingStep(1);
    }
    
    // Registrar Service Worker
    registerServiceWorker();
});

// Cargar Datos desde LocalStorage
function loadLocalData() {
    const cachedProfile = localStorage.getItem('aura_user_profile');
    const cachedHistory = localStorage.getItem('aura_workout_history');
    
    if (cachedProfile) {
        AppState.user = JSON.parse(cachedProfile);
    }
    if (cachedHistory) {
        AppState.history = JSON.parse(cachedHistory);
    }
}

// Inicializar Escuchadores de Eventos del UI
function initEventListeners() {
    // 1. Navegación Onboarding
    DOM.btnOnboardingStart.addEventListener('click', () => showOnboardingStep(2));
    
    DOM.btnOnboardingTo3.addEventListener('click', () => {
        if (validateStep2()) {
            tempProfile.name = DOM.inputName.value.trim();
            tempProfile.age = parseInt(DOM.inputAge.value);
            tempProfile.weight = parseFloat(DOM.inputWeight.value);
            tempProfile.height = parseInt(DOM.inputHeight.value);
            tempProfile.waist = parseFloat(DOM.inputWaist.value);
            tempProfile.neck = parseFloat(DOM.inputNeck.value);
            tempProfile.hip = tempProfile.sex === 'female' ? parseFloat(DOM.inputHip.value) : 0;
            showOnboardingStep(3);
        } else {
            alert("Por favor completa todos tus datos físicos y antropométricos requeridos.");
        }
    });
    
    DOM.btnOnboardingTo4.addEventListener('click', () => {
        showOnboardingStep(4);
    });
    
    DOM.btnOnboardingBackTo2.addEventListener('click', () => showOnboardingStep(2));
    DOM.btnOnboardingBackTo3.addEventListener('click', () => showOnboardingStep(3));
    
    DOM.btnOnboardingFinalize.addEventListener('click', () => {
        saveOnboardingProfile();
    });

    // 1b. Escuchadores de cálculo de IMC y Grasa en tiempo real
    if (DOM.inputWeight) DOM.inputWeight.addEventListener('input', updateIMCOnboarding);
    if (DOM.inputHeight) DOM.inputHeight.addEventListener('input', updateIMCOnboarding);
    if (DOM.inputWaist) DOM.inputWaist.addEventListener('input', updateIMCOnboarding);
    if (DOM.inputNeck) DOM.inputNeck.addEventListener('input', updateIMCOnboarding);
    if (DOM.inputHip) DOM.inputHip.addEventListener('input', updateIMCOnboarding);

    // Selector de Sexo Biológico (Onboarding)
    if (DOM.genderControl) {
        const genderBtns = DOM.genderControl.querySelectorAll('.segment-btn');
        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genderBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tempProfile.sex = btn.dataset.gender;
                if (tempProfile.sex === 'female') {
                    if (DOM.groupHip) DOM.groupHip.classList.remove('hidden');
                    if (DOM.inputHip) DOM.inputHip.required = true;
                } else {
                    if (DOM.groupHip) DOM.groupHip.classList.add('hidden');
                    if (DOM.inputHip) {
                        DOM.inputHip.required = false;
                        DOM.inputHip.value = '';
                    }
                    tempProfile.hip = 0;
                }
                updateIMCOnboarding();
            });
        });
    }

    // 2. Selectores de Onboarding (Event Delegation / Click handler)
    DOM.btnGoalOptions.forEach(card => {
        card.addEventListener('click', () => {
            DOM.btnGoalOptions.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            tempProfile.goal = card.dataset.goal;
        });
    });

    DOM.btnLevelOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.btnLevelOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tempProfile.level = btn.dataset.level;
        });
    });

    DOM.btnDayOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = parseInt(btn.dataset.day);
            if (tempProfile.days.includes(day)) {
                tempProfile.days = tempProfile.days.filter(d => d !== day);
                btn.classList.remove('active');
            } else {
                tempProfile.days.push(day);
                btn.classList.add('active');
            }
            updateOnboardingDaysPreview();
        });
    });

    // 3. Navegación Tabs Principal
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => {
            DOM.navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const targetTab = item.dataset.tab;
            DOM.tabPanes.forEach(pane => {
                if (pane.id === `tab-${targetTab}`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
            
            if (targetTab === 'dashboard') renderDashboard();
            if (targetTab === 'routines') renderRoutinesTab();
            if (targetTab === 'profile') renderProfileTab();
            if (targetTab === 'admin') renderAdminTab();
        });
    });

    // 4. Acciones del Dashboard
    DOM.btnStartWorkout.addEventListener('click', () => {
        startWorkoutSession();
    });

    // 4b. Selector Manual de Rutina
    const selectRoutine = (type) => {
        AppState.manualWorkoutSelection = type;
        DOM.btnSelectAuto.classList.toggle('active', type === 'auto');
        DOM.btnSelectUpper.classList.toggle('active', type === 'upper');
        DOM.btnSelectLower.classList.toggle('active', type === 'lower');
        renderDashboard();
    };
    if (DOM.btnSelectAuto) DOM.btnSelectAuto.addEventListener('click', () => selectRoutine('auto'));
    if (DOM.btnSelectUpper) DOM.btnSelectUpper.addEventListener('click', () => selectRoutine('upper'));
    if (DOM.btnSelectLower) DOM.btnSelectLower.addEventListener('click', () => selectRoutine('lower'));

    // 4c. Acciones de Administración
    if (DOM.btnRunClustering) {
        DOM.btnRunClustering.addEventListener('click', () => {
            const result = AURA_AI.runClustering();
            if (result.success) {
                playBeep(880, 0.15);
                renderAdminTab();
            }
        });
    }

    if (DOM.adminFilterCluster) {
        DOM.adminFilterCluster.addEventListener('change', () => {
            renderAdminTab();
        });
    }

    // 5. Controles del Player de Entrenamiento
    DOM.btnWorkoutQuit.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que quieres cancelar el entrenamiento actual? No se guardará el progreso.")) {
            quitActiveWorkout();
        }
    });

    DOM.btnPrevExercise.addEventListener('click', () => {
        if (AppState.activeExerciseIndex > 0) {
            AppState.activeExerciseIndex--;
            renderActiveExercise();
        }
    });

    DOM.btnNextExercise.addEventListener('click', () => {
        const workout = AppState.currentWorkout;
        if (AppState.activeExerciseIndex < workout.exercises.length - 1) {
            AppState.activeExerciseIndex++;
            renderActiveExercise();
        } else {
            finishWorkoutSession();
        }
    });

    // 6. Rest Timer Controls
    DOM.btnRestSkip.addEventListener('click', () => {
        skipRestTimer();
    });

    DOM.btnRestAdd30.addEventListener('click', () => {
        AppState.restSecondsRemaining += 30;
        DOM.restTimerCountdown.textContent = AppState.restSecondsRemaining;
    });

    // 7. Video Modal Controles
    DOM.btnExerciseVideo.addEventListener('click', () => {
        openVideoModal();
    });
    
    DOM.btnVideoModalClose.addEventListener('click', closeVideoModal);
    DOM.videoModalCloseOverlay.addEventListener('click', closeVideoModal);

    // 8. Resumen Final Acciones
    DOM.btnSummaryDone.addEventListener('click', () => {
        showScreen('main-layout');
        renderDashboard();
    });

    // 9. Resetear Datos
    DOM.btnResetData.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (DOM.confirmModal) DOM.confirmModal.classList.remove('hidden');
    });

    // Cancelar en el Modal de Confirmación
    const closeConfirmModal = () => {
        if (DOM.confirmModal) DOM.confirmModal.classList.add('hidden');
    };

    if (DOM.btnConfirmCancel) DOM.btnConfirmCancel.addEventListener('click', closeConfirmModal);
    if (DOM.confirmModalOverlay) DOM.confirmModalOverlay.addEventListener('click', closeConfirmModal);

    // Aceptar en el Modal de Confirmación y reiniciar
    if (DOM.btnConfirmAccept) {
        DOM.btnConfirmAccept.addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    }
}

/* ==========================================================================
   Lógicas Específicas de Flujo y Pantallas
   ========================================================================== */

// Navegar entre pantallas de forma fluida
function showScreen(screenId) {
    const screens = ['screen-onboarding', 'main-layout', 'screen-workout-active', 'screen-workout-summary'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (id === screenId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// Controlar los pasos del Onboarding
function showOnboardingStep(stepNum) {
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`onboarding-step-${i}`);
        if (i === stepNum) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    }
}

// Validar Datos Físicos
function validateStep2() {
    const baseValid = DOM.inputName.value.trim() !== '' &&
                      DOM.inputAge.value !== '' &&
                      DOM.inputWeight.value !== '' &&
                      DOM.inputHeight.value !== '' &&
                      DOM.inputWaist.value !== '' &&
                      DOM.inputNeck.value !== '';
    if (tempProfile.sex === 'female') {
        return baseValid && DOM.inputHip.value !== '';
    }
    return baseValid;
}

// Calcular y Mostrar IMC y Grasa Corporal dinámicamente en Onboarding
function updateIMCOnboarding() {
    const weight = parseFloat(DOM.inputWeight.value);
    const height = parseFloat(DOM.inputHeight.value);
    const waist = parseFloat(DOM.inputWaist.value);
    const neck = parseFloat(DOM.inputNeck.value);
    const hip = tempProfile.sex === 'female' ? parseFloat(DOM.inputHip.value) : 0;
    
    if (weight > 0 && height > 0) {
        const heightM = height / 100;
        const imc = weight / (heightM * heightM);
        const imcFormatted = imc.toFixed(1);
        
        if (DOM.imcValue) DOM.imcValue.textContent = imcFormatted;
        tempProfile.imc = parseFloat(imcFormatted);
        
        // Determinar clasificación
        let category = "Normal";
        let badgeClass = "normal";
        let desc = "¡Excelente! Tienes una relación de masa saludable.";
        
        if (imc < 18.5) {
            category = "Bajo Peso";
            badgeClass = "bajo";
            desc = "Tu peso está por debajo de lo recomendado. Enfócate en una nutrición superávit.";
        } else if (imc >= 18.5 && imc < 25) {
            category = "Normal";
            badgeClass = "normal";
            desc = "¡Excelente! Estás en un rango de peso saludable.";
        } else if (imc >= 25 && imc < 30) {
            category = "Sobrepeso";
            badgeClass = "sobrepeso";
            desc = "Sobre el rango óptimo. Tu plan de entrenamiento te ayudará a recomponer tu física.";
        } else {
            category = "Obesidad";
            badgeClass = "obesidad";
            desc = "Rango de obesidad. Te sugerimos controlar las cargas iniciales y ser constante.";
        }
        
        if (DOM.imcBadge) {
            DOM.imcBadge.textContent = category;
            DOM.imcBadge.className = `imc-category-badge ${badgeClass}`;
        }
        if (DOM.imcDesc) DOM.imcDesc.textContent = desc;

        // Calcular Grasa Corporal (Navy Seal Formula)
        if (waist > 0 && neck > 0 && (tempProfile.sex === 'male' || hip > 0)) {
            const bfp = AURA_AI.calculateNavySealBFP(tempProfile.sex, height, waist, neck, hip);
            if (DOM.bfpValue) DOM.bfpValue.textContent = `${bfp.toFixed(1)}%`;
            tempProfile.bodyFat = parseFloat(bfp.toFixed(1));
        } else {
            if (DOM.bfpValue) DOM.bfpValue.textContent = '--';
        }
        
        if (DOM.imcPreviewBox) DOM.imcPreviewBox.classList.remove('hidden');
    } else {
        if (DOM.imcPreviewBox) DOM.imcPreviewBox.classList.add('hidden');
    }
}

// Actualizar Vista de Días de Onboarding
function updateOnboardingDaysPreview() {
    const count = tempProfile.days.length;
    if (count > 0) {
        DOM.routinePreviewBox.classList.remove('hidden');
        DOM.btnOnboardingFinalize.disabled = false;
        
        let descText = '';
        if (count === 2 || count === 4) {
            descText = `División Balanceada: Alternancia de entrenamientos combinados (Día A: Torso + Abdomen, Día B: Piernas + Abdomen) para optimizar la recuperación muscular.`;
        } else if (count === 3) {
            descText = `Distribución Rotativa Óptima: Intercambiaremos las cargas de Torso + Abdomen (Día A) y Piernas + Abdomen (Día B) asegurando al menos 48 horas de descanso por bloque.`;
        } else {
            descText = `Distribución Avanzada de Volumen: Se modulará la intensidad de tus entrenamientos combinados diarios de Torso + Abdomen y Piernas + Abdomen para evitar sobreentrenamiento.`;
        }
        DOM.routineDistributionDesc.textContent = descText;
    } else {
        DOM.routinePreviewBox.classList.add('hidden');
        DOM.btnOnboardingFinalize.disabled = true;
    }
}

// Finalizar Onboarding e Inicializar Perfil
function saveOnboardingProfile() {
    // Generar la racha inicial y días de entreno
    AppState.user = {
        name: tempProfile.name,
        age: tempProfile.age,
        sex: tempProfile.sex,
        weight: tempProfile.weight,
        height: tempProfile.height,
        waist: tempProfile.waist,
        neck: tempProfile.neck,
        hip: tempProfile.hip,
        goal: tempProfile.goal,
        level: tempProfile.level,
        days: [...tempProfile.days],
        streak: 0,
        lastWorkoutDate: null,
        imc: tempProfile.imc || parseFloat((tempProfile.weight / Math.pow(tempProfile.height / 100, 2)).toFixed(1)),
        bodyFat: tempProfile.bodyFat || 20.0,
        assignedCluster: "Pendiente"
    };
    
    localStorage.setItem('aura_user_profile', JSON.stringify(AppState.user));
    showScreen('main-layout');
    
    // Ir a pestaña del Dashboard
    DOM.navItems[0].click();
}

/* ==========================================================================
   Motor de Distribución de Entrenamiento
   ========================================================================== */
function getTodayWorkout() {
    if (!AppState.user) return { rest: true };
    
    let targetBlock = 'upper';
    let isManual = false;
    
    if (AppState.manualWorkoutSelection && AppState.manualWorkoutSelection !== 'auto') {
        targetBlock = AppState.manualWorkoutSelection;
        isManual = true;
    } else {
        if (AppState.user.days.length === 0) return { rest: true };
        
        const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
        const isTrainingDay = AppState.user.days.includes(today);
        
        if (!isTrainingDay) {
            return { rest: true, name: "Día de Descanso / Recuperación", desc: "El músculo crece durante el descanso. Mantente hidratado." };
        }
        
        const totalCompleted = AppState.history.length;
        targetBlock = (totalCompleted % 2 === 0) ? 'upper' : 'lower';
    }
    
    const baseRoutine = WORKOUT_DATABASE[targetBlock];
    const coreRoutine = WORKOUT_DATABASE['core'];
    
    const combinedName = `${baseRoutine.name} + ${coreRoutine.name}`;
    const baseMin = parseInt(baseRoutine.duration) || 30;
    const coreMin = parseInt(coreRoutine.duration) || 15;
    const combinedDuration = `${baseMin + coreMin} min`;
    
    const combinedExercises = [
        ...JSON.parse(JSON.stringify(baseRoutine.exercises)),
        ...JSON.parse(JSON.stringify(coreRoutine.exercises))
    ];
    
    return {
        rest: false,
        key: targetBlock,
        name: combinedName,
        duration: combinedDuration,
        exercises: combinedExercises,
        isManual: isManual
    };
}

/* ==========================================================================
   Renderizado de Datos e Interfaz
   ========================================================================== */

// Renderizar Dashboard Principal
function renderDashboard() {
    if (!AppState.user) return;
    
    // Sincronizar botones de selección manual
    const selection = AppState.manualWorkoutSelection || 'auto';
    if (DOM.btnSelectAuto) DOM.btnSelectAuto.classList.toggle('active', selection === 'auto');
    if (DOM.btnSelectUpper) DOM.btnSelectUpper.classList.toggle('active', selection === 'upper');
    if (DOM.btnSelectLower) DOM.btnSelectLower.classList.toggle('active', selection === 'lower');
    
    // 1. Bienvenida y datos básicos
    DOM.userGreeting.textContent = `Hola, ${AppState.user.name}`;
    DOM.avatarInitials.textContent = AppState.user.name.charAt(0).toUpperCase();
    
    // 2. Racha y porcentaje
    updateStreak();
    DOM.statStreak.textContent = AppState.user.streak;
    
    // Meta Semanal Completados
    const weeklyCompletion = calculateWeeklyMetaPercentage();
    DOM.statCompletion.textContent = `${weeklyCompletion}%`;
    
    // 3. Grid de días semanales
    renderWeeklyDots();
    
    // 4. Tarjeta de rutina de Hoy
    const todayWorkout = getTodayWorkout();
    if (todayWorkout.rest) {
        DOM.todayWorkoutTitle.textContent = todayWorkout.name;
        DOM.todayWorkoutDetails.textContent = todayWorkout.desc;
        DOM.todayWorkoutTag.textContent = "Recuperación";
        DOM.todayWorkoutTag.className = "badge badge-glow";
        DOM.btnStartWorkout.classList.add('hidden');
    } else {
        DOM.todayWorkoutTitle.textContent = todayWorkout.name;
        DOM.todayWorkoutDetails.textContent = `Enfoque en ${todayWorkout.key === 'upper' ? 'Torso + Abdomen' : 'Piernas + Abdomen'} • ${todayWorkout.duration}`;
        DOM.todayWorkoutTag.textContent = "Rutina del Día";
        DOM.todayWorkoutTag.className = "badge badge-glow";
        DOM.btnStartWorkout.classList.remove('hidden');
    }
}

// Renderizar Dots Semanales
function renderWeeklyDots() {
    DOM.weeklyDaysDots.innerHTML = '';
    const daysName = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const today = new Date().getDay();
    
    // Obtener entrenamientos de esta semana
    const thisWeekCompletedDays = getThisWeekCompletedDays();
    
    // Renderizar Lunes a Domingo (orden clásico: L, M, M, J, V, S, D)
    const renderOrder = [1, 2, 3, 4, 5, 6, 0];
    
    renderOrder.forEach(dayIndex => {
        const dot = document.createElement('div');
        dot.className = 'weekly-day-dot';
        
        const isToday = (dayIndex === today);
        const isCompleted = thisWeekCompletedDays.includes(dayIndex);
        
        if (isToday) dot.classList.add('today');
        if (isCompleted) dot.classList.add('completed');
        if (AppState.user.days.includes(dayIndex)) dot.classList.add('active');
        
        dot.innerHTML = `
            <span class="weekly-day-lbl">${daysName[dayIndex]}</span>
            <div class="weekly-dot-circle">${isCompleted ? '✓' : daysName[dayIndex]}</div>
        `;
        
        DOM.weeklyDaysDots.appendChild(dot);
    });
}

// Obtener los días de la semana actual que fueron completados
function getThisWeekCompletedDays() {
    const today = new Date();
    // Obtener Lunes de la semana actual
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const completedDays = [];
    AppState.history.forEach(log => {
        const logDate = new Date(log.date);
        if (logDate >= monday) {
            completedDays.push(logDate.getDay());
        }
    });
    
    return completedDays;
}

// Calcular % de Rutinas Semanales Completadas
function calculateWeeklyMetaPercentage() {
    if (!AppState.user) return 0;
    const daysToTrainThisWeek = AppState.user.days.length;
    if (daysToTrainThisWeek === 0) return 0;
    
    const completedThisWeek = getThisWeekCompletedDays().length;
    const percentage = Math.round((completedThisWeek / daysToTrainThisWeek) * 100);
    return Math.min(percentage, 100);
}

// Actualizar Racha Diaria (Streak)
function updateStreak() {
    if (!AppState.user || !AppState.user.lastWorkoutDate) return;
    
    const lastWorkout = new Date(AppState.user.lastWorkoutDate);
    lastWorkout.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - lastWorkout);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
        // Se rompió la racha (más de 24h sin entrenar)
        AppState.user.streak = 0;
        localStorage.setItem('aura_user_profile', JSON.stringify(AppState.user));
    }
}

// Renderizar Pestaña de Rutinas Completa
function renderRoutinesTab() {
    DOM.routinesContainer.innerHTML = '';
    
    const keys = ['upper', 'lower', 'core'];
    keys.forEach(key => {
        const routine = WORKOUT_DATABASE[key];
        const card = document.createElement('div');
        card.className = 'routine-block-card';
        
        let exercisesHtml = '';
        routine.exercises.forEach(ex => {
            exercisesHtml += `
                <div class="routine-exercise-item">
                    <span class="exercise-item-name">${ex.name}</span>
                    <span class="exercise-item-sets">${ex.sets.length} series x ${ex.sets[0].reps} rep.</span>
                </div>
            `;
        });
        
        card.innerHTML = `
            <div class="routine-block-header">
                <h2 class="routine-block-title">${routine.name}</h2>
                <span class="badge badge-glow">${routine.duration}</span>
            </div>
            <p class="text-secondary text-xs" style="margin-bottom: 12px;">Grupos musculares enfocados en este bloque de trabajo.</p>
            <div class="routine-block-exercises">
                ${exercisesHtml}
            </div>
        `;
        
        DOM.routinesContainer.appendChild(card);
    });
}

// Renderizar Pestaña de Perfil
function renderProfileTab() {
    if (!AppState.user) return;
    
    DOM.profileInitials.textContent = AppState.user.name.charAt(0).toUpperCase();
    DOM.profileName.textContent = AppState.user.name;
    
    const imcVal = AppState.user.imc || (AppState.user.weight && AppState.user.height ? parseFloat((AppState.user.weight / Math.pow(AppState.user.height / 100, 2)).toFixed(1)) : null);
    const imcText = imcVal ? ` • IMC: ${imcVal}` : '';
    const bfpVal = AppState.user.bodyFat || (AppState.user.weight && AppState.user.height ? parseFloat(AURA_AI.calculateNavySealBFP(AppState.user.sex || 'male', AppState.user.height, AppState.user.waist || 80, AppState.user.neck || 36, AppState.user.hip || 0).toFixed(1)) : null);
    const bfpText = bfpVal ? ` • Grasa: ${bfpVal}%` : '';
    
    DOM.profileStatsSummary.textContent = `Objetivo: ${AppState.user.goal.toUpperCase()} • Nivel: ${AppState.user.level.toUpperCase()} • Peso: ${AppState.user.weight} kg${imcText}${bfpText}`;
    
    // Estadísticas
    DOM.profileTotalWorkouts.textContent = AppState.history.length;
    
    let totalSets = 0;
    AppState.history.forEach(log => totalSets += log.setsCount || 0);
    DOM.profileTotalSets.textContent = totalSets;
    
    // Render Historial Reciente
    DOM.historyItemsContainer.innerHTML = '';
    
    if (AppState.history.length === 0) {
        DOM.historyItemsContainer.innerHTML = `<p class="text-secondary text-sm text-center" style="padding: 20px 0;">No hay entrenamientos registrados todavía.</p>`;
        return;
    }
    
    // Mostrar últimos 5 entrenamientos ordenados por fecha descendente
    const sortedHistory = [...AppState.history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    sortedHistory.forEach(log => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const dateFormatted = new Date(log.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        item.innerHTML = `
            <div class="history-item-left">
                <span class="history-item-title">${log.routineName}</span>
                <span class="history-item-date">${dateFormatted}</span>
            </div>
            <div class="history-item-right">
                <span class="history-item-volume">${log.volume || 0} kg</span>
                <span class="history-item-duration">${log.duration || '00:00'}</span>
            </div>
        `;
        
        DOM.historyItemsContainer.appendChild(item);
    });
}

/* ==========================================================================
   Workout Player Logic (Active Workout)
   ========================================================================== */

// Iniciar sesión de entrenamiento activa
function startWorkoutSession() {
    const todayWorkout = getTodayWorkout();
    if (todayWorkout.rest) return;
    
    AppState.currentWorkout = todayWorkout;
    AppState.workoutActive = true;
    AppState.activeExerciseIndex = 0;
    AppState.workoutSecondsElapsed = 0;
    AppState.workoutStartTime = new Date();
    
    // Inicializar pesos de los sets cargados
    AppState.currentWorkout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            set.weight = 0; // Por defecto peso corporal (0kg)
            set.completed = false;
        });
    });
    
    showScreen('screen-workout-active');
    renderActiveExercise();
    
    // Iniciar temporizador del entrenamiento
    clearInterval(AppState.workoutTimerInterval);
    AppState.workoutTimerInterval = setInterval(() => {
        AppState.workoutSecondsElapsed++;
        DOM.activeWorkoutTimer.textContent = formatTime(AppState.workoutSecondsElapsed);
    }, 1000);
}

// Salir del entrenamiento activo
function quitActiveWorkout() {
    clearInterval(AppState.workoutTimerInterval);
    AppState.workoutActive = false;
    AppState.currentWorkout = null;
    showScreen('main-layout');
    renderDashboard();
}

// Renderizar Ejercicio Activo
function renderActiveExercise() {
    const workout = AppState.currentWorkout;
    const exercise = workout.exercises[AppState.activeExerciseIndex];
    
    // Info General
    DOM.activeWorkoutName.textContent = workout.name;
    DOM.activeWorkoutIndex.textContent = `${AppState.activeExerciseIndex + 1} / ${workout.exercises.length}`;
    DOM.exerciseTargetMuscle.textContent = exercise.muscle;
    DOM.exerciseActiveName.textContent = exercise.name;
    
    // Renderizar Ilustración del Ejercicio (CSS/SVG Animado)
    DOM.exerciseIllustration.innerHTML = `<div class="${exercise.animationClass}">
        ${getAnimationExtraElements(exercise.animationClass)}
    </div>`;
    
    // Renderizar Instrucciones
    DOM.exerciseInstructionsList.innerHTML = '';
    exercise.instructions.forEach((step, idx) => {
        const stepEl = document.createElement('p');
        stepEl.innerHTML = `<span class="text-cyan font-mono">${idx + 1}.</span> ${step}`;
        DOM.exerciseInstructionsList.appendChild(stepEl);
    });
    
    // Controles de Footer
    DOM.btnPrevExercise.disabled = (AppState.activeExerciseIndex === 0);
    
    if (AppState.activeExerciseIndex === workout.exercises.length - 1) {
        DOM.btnNextExercise.textContent = "Finalizar";
        DOM.btnNextExercise.className = "btn btn-primary btn-half btn-glow";
    } else {
        DOM.btnNextExercise.textContent = "Siguiente";
        DOM.btnNextExercise.className = "btn btn-primary btn-half btn-glow";
    }
    
    // Renderizar Filas de Registro de Series
    renderSetsRows(exercise);
}

// Generar elementos secundarios adicionales de las animaciones CSS
function getAnimationExtraElements(animationClass) {
    if (animationClass === 'pushup-animation') {
        return `<div class="pushup-body"></div><div class="pushup-arms"></div>`;
    }
    if (animationClass === 'squat-animation') {
        return `<div class="squat-torso"></div><div class="squat-legs"></div>`;
    }
    if (animationClass === 'dips-animation') {
        return `<div class="dips-bar"></div><div class="dips-body"></div>`;
    }
    if (animationClass === 'press-animation') {
        return `<div class="press-body"></div><div class="press-barbell"></div>`;
    }
    if (animationClass === 'bridge-animation') {
        return `<div class="bridge-hips"></div>`;
    }
    if (animationClass === 'crunch-animation') {
        return `<div class="crunch-legs"></div><div class="crunch-torso"></div>`;
    }
    return '';
}

// Renderizar Filas de Series
function renderSetsRows(exercise) {
    DOM.setsRowsContainer.innerHTML = '';
    
    exercise.sets.forEach((set, idx) => {
        const row = document.createElement('div');
        row.className = `set-row ${set.completed ? 'completed' : ''}`;
        
        row.innerHTML = `
            <span class="set-num">${idx + 1}</span>
            <span class="set-obj">${set.reps} reps</span>
            <div>
                <input type="number" class="set-input weight-input" data-index="${idx}" value="${set.weight}" min="0">
            </div>
            <div>
                <input type="number" class="set-input reps-input" data-index="${idx}" value="${set.reps}" min="1">
            </div>
            <div>
                <div class="set-checkbox" data-index="${idx}"></div>
            </div>
        `;
        
        // Escuchadores de eventos para campos y checkbox
        const weightInput = row.querySelector('.weight-input');
        weightInput.addEventListener('change', (e) => {
            set.weight = parseFloat(e.target.value) || 0;
        });

        const repsInput = row.querySelector('.reps-input');
        repsInput.addEventListener('change', (e) => {
            set.reps = parseInt(e.target.value) || 0;
        });

        const checkbox = row.querySelector('.set-checkbox');
        checkbox.addEventListener('click', () => {
            toggleSetCompletion(exercise, idx, row);
        });
        
        DOM.setsRowsContainer.appendChild(row);
    });
}

// Cambiar estado completado de un Set
function toggleSetCompletion(exercise, setIndex, rowElement) {
    const set = exercise.sets[setIndex];
    set.completed = !set.completed;
    
    if (set.completed) {
        rowElement.classList.add('completed');
        playBeep(880, 0.15); // Sonido Beep Afilado de Éxito
        
        // No abrir descanso en el último ejercicio, último set
        const workout = AppState.currentWorkout;
        const isLastExercise = AppState.activeExerciseIndex === workout.exercises.length - 1;
        const isLastSet = setIndex === exercise.sets.length - 1;
        
        if (!(isLastExercise && isLastSet)) {
            openRestTimer();
        }
    } else {
        rowElement.classList.remove('completed');
        playBeep(440, 0.1);
    }
}

// Web Audio API Beep Generator
function playBeep(frequency, duration) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio no disponible.", e);
    }
}

/* ==========================================================================
   Rest Timer Controller
   ========================================================================== */
function openRestTimer() {
    AppState.restSecondsRemaining = AppState.restTotalDuration;
    DOM.restTimerCountdown.textContent = AppState.restSecondsRemaining;
    DOM.restTimerOverlay.classList.remove('hidden');
    
    clearInterval(AppState.restTimerInterval);
    AppState.restTimerInterval = setInterval(() => {
        AppState.restSecondsRemaining--;
        DOM.restTimerCountdown.textContent = AppState.restSecondsRemaining;
        
        if (AppState.restSecondsRemaining <= 3 && AppState.restSecondsRemaining > 0) {
            playBeep(600, 0.1); // Beep previo
        }
        
        if (AppState.restSecondsRemaining <= 0) {
            playBeep(1200, 0.35); // Beep largo final
            skipRestTimer();
        }
    }, 1000);
}

function skipRestTimer() {
    clearInterval(AppState.restTimerInterval);
    DOM.restTimerOverlay.classList.add('hidden');
}

/* ==========================================================================
   Finalización y Resumen de Entrenamiento
   ========================================================================== */
function finishWorkoutSession() {
    clearInterval(AppState.workoutTimerInterval);
    AppState.workoutActive = false;
    
    // Calcular Estadísticas
    const duration = formatTime(AppState.workoutSecondsElapsed);
    
    let volume = 0;
    let setsCount = 0;
    AppState.currentWorkout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            if (set.completed) {
                // Si es ejercicio con peso corporal (0kg), estimamos peso base o solo sumamos sets
                volume += (set.weight || 0) * (set.reps || 0);
                setsCount++;
            }
        });
    });
    
    // Actualizar Racha de Usuario en LocalStorage
    const todayStr = new Date().toISOString();
    
    let isStreakUpdated = false;
    if (AppState.user) {
        const lastWorkout = AppState.user.lastWorkoutDate ? new Date(AppState.user.lastWorkoutDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!lastWorkout) {
            AppState.user.streak = 1;
            isStreakUpdated = true;
        } else {
            lastWorkout.setHours(0, 0, 0, 0);
            const diffTime = Math.abs(today - lastWorkout);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                AppState.user.streak += 1;
                isStreakUpdated = true;
            } else if (diffDays > 1) {
                AppState.user.streak = 1;
                isStreakUpdated = true;
            }
        }
        
        AppState.user.lastWorkoutDate = todayStr;
        localStorage.setItem('aura_user_profile', JSON.stringify(AppState.user));
    }
    
    // Guardar en Historial
    const loggedSets = [];
    AppState.currentWorkout.exercises.forEach(ex => {
        ex.sets.forEach((set, setIdx) => {
            if (set.completed) {
                loggedSets.push({
                    exerciseName: ex.name,
                    setIndex: setIdx,
                    reps: set.reps,
                    weight: set.weight,
                    completed: true
                });
            }
        });
    });

    const log = {
        date: todayStr,
        routineName: AppState.currentWorkout.name,
        duration: duration,
        volume: volume,
        setsCount: setsCount,
        sets: loggedSets
    };
    AppState.history.push(log);
    localStorage.setItem('aura_workout_history', JSON.stringify(AppState.history));
    
    // Sincronizar en base de datos multiusuario
    try {
        AURA_AI.addLog("active-user", {
            routineName: AppState.currentWorkout.name,
            duration: duration,
            volume: volume,
            setsCount: setsCount,
            sets: loggedSets
        });
        AURA_AI.runClustering();
    } catch (err) {
        console.error("Error al sincronizar con AURA_AI:", err);
    }
    
    // Mostrar Pantalla de Éxito
    DOM.summaryDuration.textContent = duration;
    DOM.summaryVolume.textContent = `${volume} kg`;
    DOM.summarySets.textContent = setsCount;
    DOM.summaryBadgeText.textContent = isStreakUpdated 
        ? `🔥 ¡Aumentaste tu racha de constancia a ${AppState.user.streak} días!`
        : `💪 ¡Gran trabajo! Sigue constante en tu rutina diaria.`;
        
    showScreen('screen-workout-summary');
    
    // Ejecutar Confetti
    runConfetti(DOM.summaryConfetti);
}

/* ==========================================================================
   Motor de Confetti (Nativo Canvas)
   ========================================================================== */
function runConfetti(canvas) {
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    let particles = [];
    const colors = ['#7b2cbf', '#00f5d4', '#ff007f', '#00b4d8', '#ffffff'];
    
    for (let i = 0; i < 90; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 5 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.08 + 0.03,
            tiltAngle: 0
        });
    }
    
    let animationFrameId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let remaining = false;
        particles.forEach((p, idx) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
            
            if (p.y < canvas.height) {
                remaining = true;
            }
            
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });
        
        if (remaining) {
            animationFrameId = requestAnimationFrame(draw);
        }
    }
    
    draw();
    setTimeout(() => {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4500);
}

/* ==========================================================================
   Modales y Videos de YouTube
   ========================================================================== */
function openVideoModal() {
    const workout = AppState.currentWorkout;
    const exercise = workout.exercises[AppState.activeExerciseIndex];
    
    DOM.videoModalTitle.textContent = `Guía: ${exercise.name}`;
    DOM.videoIframePlaceholder.innerHTML = `<iframe 
        src="${exercise.videoUrl}" 
        title="YouTube video player" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
    </iframe>`;
    
    DOM.videoModal.classList.remove('hidden');
}

function closeVideoModal() {
    DOM.videoModal.classList.add('hidden');
    DOM.videoIframePlaceholder.innerHTML = ''; // Detener reproducción del video
}

/* ==========================================================================
   Funciones Auxiliares
   ========================================================================== */
function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds - (hrs * 3600)) / 60);
    const secs = totalSeconds % 60;
    
    const formattedMins = mins < 10 ? '0' + mins : mins;
    const formattedSecs = secs < 10 ? '0' + secs : secs;
    
    if (hrs > 0) {
        const formattedHrs = hrs < 10 ? '0' + hrs : hrs;
        return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
}

// Registrar Service Worker para PWA Offline
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado con éxito.', reg.scope))
            .catch(err => console.warn('Fallo al registrar Service Worker.', err));
    }
}

/* ==========================================================================
   Admin Pane Render Logic
   ========================================================================== */
function renderAdminTab() {
    // 1. Obtener usuarios y asegurar sincronización
    const users = AURA_AI.getUsers();
    
    // Contar por clúster (siempre sobre el total)
    let committedCount = 0;
    let irregularCount = 0;
    let highriskCount = 0;
    
    users.forEach(u => {
        if (u.assignedCluster === 'Comprometido') committedCount++;
        else if (u.assignedCluster === 'Irregular') irregularCount++;
        else if (u.assignedCluster === 'Alto riesgo') highriskCount++;
    });
    
    if (DOM.adminCountCommitted) DOM.adminCountCommitted.textContent = committedCount;
    if (DOM.adminCountIrregular) DOM.adminCountIrregular.textContent = irregularCount;
    if (DOM.adminCountHighrisk) DOM.adminCountHighrisk.textContent = highriskCount;
    
    // Correr clustering y obtener iteraciones
    const clusterResult = AURA_AI.runClustering();
    if (DOM.adminAiIterations) DOM.adminAiIterations.textContent = clusterResult.iterations || 2;
    
    // Obtener valor del filtro
    const filterValue = DOM.adminFilterCluster ? DOM.adminFilterCluster.value : 'all';
    let filteredUsers = clusterResult.users;
    if (filterValue !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.assignedCluster === filterValue);
    }
    
    // 2. Renderizar Tabla de Usuarios
    if (DOM.adminUsersTableBody) {
        DOM.adminUsersTableBody.innerHTML = '';
        filteredUsers.forEach(user => {
            const tr = document.createElement('tr');
            
            let lastDateStr = '--';
            if (user.lastWorkoutDate) {
                lastDateStr = new Date(user.lastWorkoutDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                });
            }
            
            let clusterClass = 'irregular';
            if (user.assignedCluster === 'Comprometido') clusterClass = 'committed';
            else if (user.assignedCluster === 'Alto riesgo') clusterClass = 'highrisk';
            
            const fatVal = user.bodyFat ? `${user.bodyFat.toFixed(1)}%` : '--';
            
            tr.innerHTML = `
                <td class="user-name-col">${user.name}</td>
                <td class="user-level-col">${user.level}</td>
                <td class="font-mono text-neon-pink">${fatVal}</td>
                <td>${lastDateStr}</td>
                <td class="font-mono">🔥 ${user.streak}</td>
                <td><span class="cluster-badge ${clusterClass}">${user.assignedCluster || 'Irregular'}</span></td>
            `;
            DOM.adminUsersTableBody.appendChild(tr);
        });
    }
    
    // 3. Renderizar Notificaciones de Recuperación
    if (DOM.adminNotificationsContainer) {
        DOM.adminNotificationsContainer.innerHTML = '';
        const notifications = AURA_AI.generateNotifications();
        
        if (notifications.length === 0) {
            DOM.adminNotificationsContainer.innerHTML = `<p class="text-secondary text-xs text-center" style="padding: 20px 0;">No hay atletas en "Alto riesgo" actualmente.</p>`;
            return;
        }
        
        notifications.forEach(notif => {
            const card = document.createElement('div');
            card.className = 'admin-notification-card';
            
            card.innerHTML = `
                <div class="notif-header">
                    <span class="notif-user-tag">${notif.userName}</span>
                    <span class="notif-risk-badge">Alto Riesgo</span>
                </div>
                <p class="notif-message">"${notif.message}"</p>
                <div class="notif-actions">
                    <button class="btn-notif-send">Enviar Alerta</button>
                </div>
            `;
            
            const sendBtn = card.querySelector('.btn-notif-send');
            sendBtn.addEventListener('click', () => {
                sendBtn.textContent = 'Enviada ✓';
                sendBtn.disabled = true;
                card.classList.add('sent');
                playBeep(1000, 0.2);
            });
            
            DOM.adminNotificationsContainer.appendChild(card);
        });
    }
}
