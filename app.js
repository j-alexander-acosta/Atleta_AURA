/* ==========================================================================
   AURA FITNESS BUSINESS LOGIC - APP.JS
   ========================================================================== */

// 1. Catálogo Completo de Ejercicios y Rutinas (Cargado dinámicamente desde SQLite)
let WORKOUT_DATABASE = {};

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
    exerciseMachineBadge: document.getElementById('exercise-machine-badge'),
    exerciseMachineInfo: document.getElementById('exercise-machine-info'),
    exerciseMachineZone: document.getElementById('exercise-machine-zone'),
    exerciseMachineDesc: document.getElementById('exercise-machine-desc'),
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
    imcHealthyRangeText: document.getElementById('imc-healthy-range-text'),
    imcWeightStatusText: document.getElementById('imc-weight-status-text'),
    imcSliderIndicator: document.getElementById('imc-slider-indicator'),

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
    confirmModalOverlay: document.getElementById('confirm-modal-overlay'),

    // Nuevos elementos agregados
    profileTypeControl: document.getElementById('profile-type-control'),
    inputMuscleMass: document.getElementById('input-muscle-mass'),
    inputSkeletalMuscle: document.getElementById('input-skeletal-muscle'),
    dashboardAlerts: document.getElementById('dashboard-alerts'),
    btnShowQr: document.getElementById('btn-show-qr'),
    formUpdateMetrics: document.getElementById('form-update-metrics'),
    profileInputWeight: document.getElementById('profile-input-weight'),
    profileInputHeight: document.getElementById('profile-input-height'),
    profileInputMuscleMass: document.getElementById('profile-input-muscle-mass'),
    profileInputSkeletalMuscle: document.getElementById('profile-input-skeletal-muscle'),
    profileInputType: document.getElementById('profile-input-type'),
    profileKinesiologyPanel: document.getElementById('profile-kinesiology-panel'),
    kinesiologyStatusView: document.getElementById('kinesiology-status-view'),
    kinesiologyReportForm: document.getElementById('kinesiology-report-form'),
    inputInjuryDetails: document.getElementById('input-injury-details'),
    btnSubmitInjury: document.getElementById('btn-submit-injury'),
    accessModal: document.getElementById('access-modal'),
    accessModalOverlay: document.getElementById('access-modal-overlay'),
    btnAccessModalClose: document.getElementById('btn-access-modal-close'),
    barcodePlaceholder: document.getElementById('barcode-placeholder'),
    accessModalUserName: document.getElementById('access-modal-username'),
    accessModalUserType: document.getElementById('access-modal-usertype'),
    adminBarcodeSelectUser: document.getElementById('admin-barcode-select-user'),
    btnSimulateBarcodeScan: document.getElementById('btn-simulate-barcode-scan'),
    adminAttendanceTableBody: document.getElementById('admin-attendance-table-body')
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
    bodyFat: 0,
    profileType: 'estudiante',
    muscleMass: 0,
    skeletalMuscle: 0,
    injured: 0,
    injuryDetails: ''
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
    
    // Cargar rutinas y máquinas desde el servidor
    fetchRoutinesFromServer(() => {
        if (AppState.user) {
            showScreen('main-layout');
            renderDashboard();
            renderRoutinesTab();
            renderProfileTab();
        } else {
            showScreen('screen-onboarding');
            showOnboardingStep(1);
        }
    });
    
    // Registrar Service Worker
    registerServiceWorker();
});

function fetchRoutinesFromServer(callback) {
    fetch('/api/routines')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.routines) {
                WORKOUT_DATABASE = data.routines;
                console.log("Rutinas y equipamiento cargados dinámicamente desde el servidor.");
            } else {
                console.error("No se pudieron obtener las rutinas desde el servidor.");
            }
            if (callback) callback();
        })
        .catch(err => {
            console.error("Error conectando con el servidor para obtener rutinas:", err);
            if (callback) callback();
        });
}

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
    
    // Escuchador para control segmentado de Tipo de Perfil en Onboarding
    if (DOM.profileTypeControl) {
        const typeBtns = DOM.profileTypeControl.querySelectorAll('.segment-btn');
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tempProfile.profileType = btn.dataset.type;
            });
        });
    }

    DOM.btnOnboardingTo3.addEventListener('click', () => {
        if (validateStep2()) {
            tempProfile.name = DOM.inputName.value.trim();
            tempProfile.age = parseInt(DOM.inputAge.value);
            tempProfile.weight = parseFloat(DOM.inputWeight.value);
            tempProfile.height = parseInt(DOM.inputHeight.value);
            tempProfile.waist = parseFloat(DOM.inputWaist.value);
            tempProfile.neck = parseFloat(DOM.inputNeck.value);
            tempProfile.hip = tempProfile.sex === 'female' ? parseFloat(DOM.inputHip.value) : 0;
            tempProfile.muscleMass = parseFloat(DOM.inputMuscleMass.value) || 0.0;
            tempProfile.skeletalMuscle = parseFloat(DOM.inputSkeletalMuscle.value) || 0.0;
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
        setTimeout(() => {
            if (DOM.confirmModal) DOM.confirmModal.classList.remove('hidden');
        }, 50);
    });

    // Cancelar en el Modal de Confirmación
    const closeConfirmModal = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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

    let barcodeRefreshInterval = null;

    // 10. Acciones de Código de Barras y Actualización de Métricas del Perfil
    if (DOM.btnShowAccess) {
        DOM.btnShowAccess.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!AppState || !AppState.user) return;
            
            if (DOM.accessModalUserName) DOM.accessModalUserName.textContent = AppState.user.name || 'Atleta';
            if (DOM.accessModalUserType) DOM.accessModalUserType.textContent = AppState.user.profileType === 'deportista_seleccionado' ? 'Deportista Seleccionado' : 'Estudiante';
            
            // Mostrar modal de inmediato para dar feedback al usuario
            if (DOM.accessModal) DOM.accessModal.classList.remove('hidden');
            if (DOM.barcodePlaceholder) DOM.barcodePlaceholder.innerHTML = '<p class="text-secondary text-xs text-center">Generando acceso seguro...</p>';
            
            const refreshBarcode = async () => {
                try {
                    const response = await fetch(window.location.origin + `/api/asistencia/token?usuario_id=${AppState.user.id}`);
                    const data = await response.json();
                    
                    if (data.success && data.token) {
                        if (typeof JsBarcode !== 'undefined') {
                            // Retraso minúsculo para asegurar que la modal es visible antes de medir el SVG
                            setTimeout(() => {
                                JsBarcode("#barcode-svg", data.token, {
                                    format: "CODE128",
                                    lineColor: "#000",
                                    width: 3,
                                    height: 80,
                                    displayValue: true,
                                    fontSize: 24,
                                    margin: 10
                                });
                            }, 50);
                        } else {
                            if (DOM.barcodePlaceholder) DOM.barcodePlaceholder.innerHTML = '<p class="text-secondary text-xs text-center" style="color:var(--color-danger)">Librería Barcode no disponible.</p>';
                        }
                    } else {
                        if (DOM.barcodePlaceholder) DOM.barcodePlaceholder.innerHTML = '<p class="text-secondary text-xs text-center">Error al obtener token de asistencia.</p>';
                    }
                } catch (err) {
                    console.error("Error generating Barcode:", err);
                    if (DOM.barcodePlaceholder) DOM.barcodePlaceholder.innerHTML = '<p class="text-secondary text-xs text-center">Error de red.</p>';
                }
            };

            await refreshBarcode();
            if (barcodeRefreshInterval) clearInterval(barcodeRefreshInterval);
            barcodeRefreshInterval = setInterval(refreshBarcode, 30000);
        });
    }

    const closeAccessModal = () => {
        if (DOM.accessModal) DOM.accessModal.classList.add('hidden');
        if (barcodeRefreshInterval) clearInterval(barcodeRefreshInterval);
    };
    if (DOM.btnAccessModalClose) DOM.btnAccessModalClose.addEventListener('click', closeAccessModal);
    if (DOM.accessModalOverlay) DOM.accessModalOverlay.addEventListener('click', closeAccessModal);

    if (DOM.formUpdateMetrics) {
        DOM.formUpdateMetrics.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!AppState.user) return;
            
            AppState.user.weight = parseFloat(DOM.profileInputWeight.value) || AppState.user.weight;
            AppState.user.height = parseFloat(DOM.profileInputHeight.value) || AppState.user.height;
            AppState.user.muscleMass = parseFloat(DOM.profileInputMuscleMass.value) || AppState.user.muscleMass;
            AppState.user.skeletalMuscle = parseFloat(DOM.profileInputSkeletalMuscle.value) || AppState.user.skeletalMuscle;
            if (DOM.profileInputType) {
                AppState.user.profileType = DOM.profileInputType.value || AppState.user.profileType;
            }
            
            // Recalcular IMC
            AppState.user.imc = parseFloat((AppState.user.weight / Math.pow(AppState.user.height / 100, 2)).toFixed(1));
            
            saveActiveUserToDatabase();
            renderProfileTab();
            renderDashboard();
            renderRoutinesTab();
            renderAdminTab();
            alert("✓ Métricas corporales y de perfil actualizadas correctamente.");
        });
    }

    if (DOM.btnSubmitInjury) {
        DOM.btnSubmitInjury.addEventListener('click', () => {
            if (!AppState.user || AppState.user.profileType !== 'deportista_seleccionado') return;
            
            const details = DOM.inputInjuryDetails.value.trim();
            if (!details) {
                alert("Por favor detalla la lesión antes de enviar el reporte.");
                return;
            }
            
            AppState.user.injured = 1;
            AppState.user.injuryDetails = details;
            
            saveActiveUserToDatabase();
            DOM.inputInjuryDetails.value = '';
            renderProfileTab();
            renderDashboard();
            alert("🚨 Lesión reportada. Se ha solicitado revisión médica / kinesiología.");
        });
    }

    if (DOM.btnSimulateQrScan) {
        DOM.btnSimulateQrScan.addEventListener('click', () => {
            const userId = DOM.adminQrSelectUser.value;
            if (!userId) return;
            registerUserAttendance(userId, 'standard', 'Simulación de Escaneo de Acceso QR');
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
                      DOM.inputNeck.value !== '' &&
                      DOM.inputMuscleMass.value !== '' &&
                      DOM.inputSkeletalMuscle.value !== '';
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
        
        const minHealthyWeight = (18.5 * Math.pow(height / 100, 2)).toFixed(1);
        const maxHealthyWeight = (24.9 * Math.pow(height / 100, 2)).toFixed(1);
        
        if (DOM.imcHealthyRangeText) {
            DOM.imcHealthyRangeText.textContent = `${minHealthyWeight} - ${maxHealthyWeight} kg`;
        }
        
        let statusText = '';
        let statusColor = '';
        
        if (imc < 18.5) {
            category = "Bajo Peso";
            badgeClass = "bajo";
            desc = "Tu peso está por debajo de lo recomendado. Enfócate en una nutrición superávit.";
            const diff = (parseFloat(minHealthyWeight) - weight).toFixed(1);
            statusText = `Bajo el peso mínimo recomendado por ${diff} kg`;
            statusColor = 'var(--color-danger)';
        } else if (imc >= 18.5 && imc < 25) {
            category = "Normal";
            badgeClass = "normal";
            desc = "¡Excelente! Estás en un rango de peso saludable.";
            statusText = `Peso óptimo dentro del rango saludable`;
            statusColor = 'var(--color-neon-teal)';
        } else if (imc >= 25 && imc < 30) {
            category = "Sobrepeso";
            badgeClass = "sobrepeso";
            desc = "Sobre el rango óptimo. Tu plan de entrenamiento te ayudará a recomponer tu física.";
            const diff = (weight - parseFloat(maxHealthyWeight)).toFixed(1);
            statusText = `Sobre el peso máximo recomendado por ${diff} kg`;
            statusColor = '#ffa502';
        } else {
            category = "Obesidad";
            badgeClass = "obesidad";
            desc = "Rango de obesidad. Te sugerimos controlar las cargas iniciales y ser constante.";
            const diff = (weight - parseFloat(maxHealthyWeight)).toFixed(1);
            statusText = `Sobrepeso severo (obesidad) por ${diff} kg`;
            statusColor = 'var(--color-danger)';
        }
        
        if (DOM.imcWeightStatusText) {
            DOM.imcWeightStatusText.textContent = statusText;
            DOM.imcWeightStatusText.style.color = statusColor;
        }
        
        // Calcular porcentaje del slider (rango del IMC de 15 a 35)
        const percentage = Math.min(Math.max(((imc - 15) / 20) * 100, 0), 100);
        if (DOM.imcSliderIndicator) {
            DOM.imcSliderIndicator.style.left = `calc(${percentage}% - 6px)`;
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
        assignedCluster: "Pendiente",
        profileType: tempProfile.profileType || "estudiante",
        muscleMass: tempProfile.muscleMass || 0.0,
        skeletalMuscle: tempProfile.skeletalMuscle || 0.0,
        injured: tempProfile.injured || 0,
        injuryDetails: tempProfile.injuryDetails || ""
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
    
    const isSelectedAthlete = (AppState.user.profileType === 'deportista_seleccionado');
    const baseKey = isSelectedAthlete ? `${targetBlock}_selected` : targetBlock;
    const coreKey = isSelectedAthlete ? 'core_selected' : 'core';
    
    const baseRoutine = WORKOUT_DATABASE[baseKey] || WORKOUT_DATABASE[targetBlock];
    const coreRoutine = WORKOUT_DATABASE[coreKey] || WORKOUT_DATABASE['core'];
    
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
    
    // Renderizar banners de alerta en el Dashboard
    let alertsHtml = '';
    const statusInfo = getWeightStatusInfo(AppState.user.weight, AppState.user.height);
    if (AppState.user.profileType === 'estudiante' && statusInfo.isUnderweight) {
        alertsHtml += `
            <div class="routine-preview-card" style="border-color: rgba(255, 159, 67, 0.4); background: rgba(255, 159, 67, 0.08); display: flex; flex-direction: column; gap: 4px;">
                <h4 class="preview-title" style="color: #ff9f43; display: flex; align-items: center; gap: 6px; margin: 0;">
                    ⚠️ ADVERTENCIA: Bajo Peso
                </h4>
                <p class="text-sm text-secondary" style="margin: 0;">
                    Tu peso actual es <strong>${AppState.user.weight} kg</strong>. Tu rango de peso saludable es de <strong>${statusInfo.minWeight} kg</strong> a <strong>${statusInfo.maxWeight} kg</strong>.
                </p>
                <p class="text-xs text-secondary" style="margin: 4px 0 0 0; color: #ff9f43; font-weight: 500;">
                    Debes ganar al menos <strong>${statusInfo.diff} kg</strong> para alcanzar el peso saludable mínimo (IMC 18.5).
                </p>
            </div>
        `;
    }
    
    if (AppState.user.profileType === 'deportista_seleccionado' && AppState.user.injured) {
        alertsHtml += `
            <div class="routine-preview-card" style="border-color: rgba(255, 71, 87, 0.4); background: rgba(255, 71, 87, 0.08); display: flex; flex-direction: column; gap: 4px;">
                <h4 class="preview-title" style="color: var(--color-danger); display: flex; align-items: center; gap: 6px; margin: 0;">
                    🚨 ALERTA MÉDICA: Lesión Activa
                </h4>
                <p class="text-sm text-secondary" style="margin: 0;">
                    Has reportado la lesión: <strong>"${AppState.user.injuryDetails || 'Sin detalles'}"</strong>.
                </p>
                <p class="text-xs text-secondary" style="margin: 4px 0 0 0; color: var(--color-danger); font-weight: 500;">
                    Por favor asiste a Kinesiología y registra tu sesión en recepción para agilizar tu alta.
                </p>
            </div>
        `;
    }
    
    if (DOM.dashboardAlerts) {
        DOM.dashboardAlerts.innerHTML = alertsHtml;
    }
    
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
    
    const isSelectedAthlete = (AppState.user && AppState.user.profileType === 'deportista_seleccionado');
    const keys = ['upper', 'lower', 'core'];
    keys.forEach(key => {
        const dbKey = isSelectedAthlete ? `${key}_selected` : key;
        const routine = WORKOUT_DATABASE[dbKey] || WORKOUT_DATABASE[key];
        const card = document.createElement('div');
        card.className = 'routine-block-card';
        
        let exercisesHtml = '';
        routine.exercises.forEach(ex => {
            const machineName = ex.machine ? ex.machine.name : 'Peso Corporal';
            exercisesHtml += `
                <div class="routine-exercise-item" style="align-items: flex-start; margin-bottom: 8px;">
                    <div style="display: flex; flex-direction: column;">
                        <span class="exercise-item-name">${ex.name}</span>
                        <span class="exercise-item-machine" style="font-size: 11px; color: var(--color-neon-teal); margin-top: 2px;">🔧 ${machineName}</span>
                    </div>
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
    
    const typeLabel = AppState.user.profileType === 'deportista_seleccionado' ? 'SELECCIONADO' : 'ESTUDIANTE';
    const muscleText = AppState.user.muscleMass ? ` • M. Muscular: ${AppState.user.muscleMass}%` : '';
    const skeletalText = AppState.user.skeletalMuscle ? ` • M. Esquelética: ${AppState.user.skeletalMuscle}%` : '';
    
    DOM.profileStatsSummary.textContent = `Perfil: ${typeLabel} • Objetivo: ${AppState.user.goal.toUpperCase()} • Peso: ${AppState.user.weight} kg • Estatura: ${AppState.user.height} cm${imcText}${bfpText}${muscleText}${skeletalText}`;
    
    // Poblar inputs del formulario de actualización manual de métricas
    if (DOM.profileInputWeight) DOM.profileInputWeight.value = AppState.user.weight || '';
    if (DOM.profileInputHeight) DOM.profileInputHeight.value = AppState.user.height || '';
    if (DOM.profileInputMuscleMass) DOM.profileInputMuscleMass.value = AppState.user.muscleMass || '';
    if (DOM.profileInputSkeletalMuscle) DOM.profileInputSkeletalMuscle.value = AppState.user.skeletalMuscle || '';
    if (DOM.profileInputType) DOM.profileInputType.value = AppState.user.profileType || 'estudiante';
    
    // Mostrar u ocultar panel de kinesiología
    if (AppState.user.profileType === 'deportista_seleccionado') {
        DOM.profileKinesiologyPanel.classList.remove('hidden');
        renderKinesiologyStatus();
    } else {
        DOM.profileKinesiologyPanel.classList.add('hidden');
    }
    
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
    
    // Renderizar Info de la Máquina
    if (exercise.machine) {
        DOM.exerciseMachineBadge.textContent = `🔧 ${exercise.machine.name}`;
        DOM.exerciseMachineBadge.classList.remove('hidden');
        DOM.exerciseMachineZone.textContent = exercise.machine.zone || 'Espacio Abierto';
        DOM.exerciseMachineDesc.textContent = exercise.machine.description || '';
        DOM.exerciseMachineInfo.classList.remove('hidden');
    } else {
        DOM.exerciseMachineBadge.textContent = '💪 Peso Corporal';
        DOM.exerciseMachineBadge.classList.remove('hidden');
        DOM.exerciseMachineInfo.classList.add('hidden');
    }
    
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

// Generar elementos secundarios adicionales de las animaciones CSS (ahora Imágenes 3D)
function getAnimationExtraElements(animationClass) {
    let imgSrc = '';
    let overlayHtml = '';

    if (animationClass === 'pushup-animation') {
        imgSrc = 'img/pushup.png';
        overlayHtml = '<div class="neon-arrow down-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'squat-animation') {
        imgSrc = 'img/squat.png';
        overlayHtml = '<div class="neon-arrow down-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'dips-animation') {
        imgSrc = 'img/dips.png';
        overlayHtml = '<div class="neon-arrow down-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'press-animation') {
        imgSrc = 'img/press.png';
        overlayHtml = '<div class="neon-arrow up-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'bridge-animation') {
        imgSrc = 'img/bridge.png';
        overlayHtml = '<div class="neon-arrow up-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'crunch-animation') {
        imgSrc = 'img/crunch.png';
        overlayHtml = '<div class="neon-arrow diagonal-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'mobility-animation') {
        imgSrc = 'img/mobility.png';
        overlayHtml = '<div class="neon-arrow up-arrow"></div><div class="neon-weight">MOB</div>';
    } else if (animationClass === 'leg-raises-animation') {
        imgSrc = 'img/leg_raises.png';
        overlayHtml = '<div class="neon-arrow up-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'plank-animation') {
        imgSrc = 'img/plank.png';
        overlayHtml = '<div class="neon-arrow down-arrow"></div><div class="neon-weight">ISO</div>';
    } else if (animationClass === 'russian-twists-animation') {
        imgSrc = 'img/russian_twists.png';
        overlayHtml = '<div class="neon-arrow diagonal-arrow"></div><div class="neon-weight">LBS</div>';
    } else if (animationClass === 'lunges-animation') {
        imgSrc = 'img/lunges.png';
        overlayHtml = '<div class="neon-arrow down-arrow"></div><div class="neon-weight">LBS</div>';
    }

    return `
        <div class="img-3d-wrapper">
            <img src="${imgSrc}" class="exercise-3d-img" alt="Exercise Illustration">
            <div class="neon-overlay-container">
                ${overlayHtml}
            </div>
        </div>
    `;
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
        id: 'log-' + Date.now(),
        userId: AppState.user.id || 'user-1',
        date: todayStr,
        routineName: AppState.currentWorkout.name,
        duration: duration,
        volume: volume,
        setsCount: setsCount,
        sets: loggedSets
    };
    AppState.history.push(log);
    localStorage.setItem('aura_workout_history', JSON.stringify(AppState.history));
    
    // Sincronizar en la Nube (Cloud Database & Motivation Reminders)
    fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: AppState.user, log: log })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.motivation) {
            console.log("Sincronización en la Nube exitosa");
            DOM.summaryBadgeText.innerHTML += `<br><br><span style="color:var(--aura-cyan); font-weight:bold;">${data.motivation}</span>`;
        }
    })
    .catch(err => console.error("Error sincronizando con la Nube:", err));

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
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
        caches.keys().then(function(names) {
            for (let name of names) caches.delete(name);
        });
    }
}

// Función global para forzar la limpieza completa de la aplicación
window.forceAppCleanup = function() {
    console.log("Iniciando limpieza forzada de la aplicación...");
    localStorage.clear();
    sessionStorage.clear();
    
    // Desregistrar el Service Worker para forzar la actualización de red
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
    }

    caches.keys().then(function(names) {
        let deletePromises = [];
        for (let name of names) {
            deletePromises.push(caches.delete(name));
        }
        return Promise.all(deletePromises);
    }).catch(console.error).finally(() => {
        alert("Aplicación y datos limpiados correctamente. Recargando...");
        window.location.href = window.location.pathname + '?reset=' + new Date().getTime();
    });
};

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
    
    // Poblar selector para simular QR
    if (DOM.adminQrSelectUser) {
        const selectedVal = DOM.adminQrSelectUser.value;
        DOM.adminQrSelectUser.innerHTML = '';
        users.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user.id;
            const profileLabel = user.profileType === 'deportista_seleccionado' ? 'Seleccionado' : 'Estudiante';
            opt.textContent = `${user.name} (${profileLabel})`;
            DOM.adminQrSelectUser.appendChild(opt);
        });
        if (selectedVal) DOM.adminQrSelectUser.value = selectedVal;
    }

    // 2. Renderizar Tabla de Usuarios
    if (DOM.adminUsersTableBody) {
        DOM.adminUsersTableBody.innerHTML = '';
        filteredUsers.forEach(user => {
            const tr = document.createElement('tr');
            
            let clusterClass = 'irregular';
            if (user.assignedCluster === 'Comprometido') clusterClass = 'committed';
            else if (user.assignedCluster === 'Alto riesgo') clusterClass = 'highrisk';
            
            const fatVal = user.bodyFat ? `${user.bodyFat.toFixed(1)}%` : '--';
            const imcVal = user.imc ? user.imc.toFixed(1) : '--';
            
            let stateBadge = '';
            if (user.profileType === 'deportista_seleccionado') {
                stateBadge = user.injured 
                    ? `<span class="cluster-badge" style="background: rgba(255, 71, 87, 0.15); color: var(--color-danger); border: 1px solid rgba(255, 71, 87, 0.3); font-size:10px;">Lesionado</span>`
                    : `<span class="cluster-badge" style="background: rgba(0, 245, 212, 0.15); color: var(--color-neon-teal); border: 1px solid rgba(0, 245, 212, 0.3); font-size:10px;">Sano</span>`;
            } else {
                stateBadge = `<span class="cluster-badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); border: 1px solid var(--border-color); font-size:10px;">Estudiante</span>`;
            }

            const profileLabel = user.profileType === 'deportista_seleccionado' ? 'Selección' : 'Estudiante';
            const muscleVal = user.muscleMass ? `${user.muscleMass}%` : '--';
            const skeletalVal = user.skeletalMuscle ? `${user.skeletalMuscle}%` : '--';
            const metricsText = `${user.height} cm<br>Mus: ${muscleVal}<br>Esq: ${skeletalVal}`;
            const bfpImcText = `Grasa: ${fatVal}<br>IMC: ${imcVal}`;

            const kineButton = (user.profileType === 'deportista_seleccionado' && user.injured)
                ? `<button class="btn btn-primary btn-sm btn-kine" style="padding: 4px 6px; font-size: 10px; margin-left: 2px; background: var(--color-neon-purple); border-color: rgba(123, 44, 191, 0.4);" data-id="${user.id}">+ Kine</button>`
                : '';

            tr.innerHTML = `
                <td class="user-name-col" style="font-weight:600; font-size:13px;">${user.name}</td>
                <td><span style="font-size: 12px; font-weight: 500; color:var(--text-primary);">${profileLabel}</span><br><span style="font-size: 11px; color: var(--text-secondary);">${user.level}</span></td>
                <td style="font-size: 11px; color: var(--text-secondary); line-height: 1.3;">${metricsText}</td>
                <td class="font-mono text-neon-pink" style="font-size: 11px; line-height: 1.3;">${bfpImcText}</td>
                <td>${stateBadge}</td>
                <td><span class="cluster-badge ${clusterClass}" style="font-size:10px;">${user.assignedCluster || 'Irregular'}</span><br><span style="font-size: 11px; color: var(--text-secondary);">Racha: 🔥 ${user.streak}</span></td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn btn-primary btn-sm btn-attendance-check" style="padding: 4px 6px; font-size: 10px;" data-id="${user.id}">+ Gral</button>
                        ${kineButton}
                    </div>
                </td>
            `;
            
            // Vincular eventos a los botones creados
            tr.querySelector('.btn-attendance-check').addEventListener('click', () => {
                registerUserAttendance(user.id, 'standard');
            });
            
            const kBtn = tr.querySelector('.btn-kine');
            if (kBtn) {
                kBtn.addEventListener('click', () => {
                    registerUserAttendance(user.id, 'kinesiology', `Rehabilitación: ${user.injuryDetails || ''}`);
                });
            }

            DOM.adminUsersTableBody.appendChild(tr);
        });
    }
    
    // Renderizar historial de ingresos del día
    renderAttendanceHistory();

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

// Calcular rango de peso saludable e información si está bajo peso
function getWeightStatusInfo(weight, height) {
    const heightM = height / 100;
    const minWeight = parseFloat((18.5 * heightM * heightM).toFixed(1));
    const maxWeight = parseFloat((24.9 * heightM * heightM).toFixed(1));
    const isUnderweight = weight < minWeight;
    const diff = isUnderweight ? parseFloat((minWeight - weight).toFixed(1)) : 0.0;
    
    return {
        minWeight,
        maxWeight,
        isUnderweight,
        diff
    };
}

// Renderizar el estado de Kinesiología y reportes de lesión
function renderKinesiologyStatus() {
    if (!AppState.user || AppState.user.profileType !== 'deportista_seleccionado') return;
    
    const viewContainer = DOM.kinesiologyStatusView;
    const formContainer = DOM.kinesiologyReportForm;
    
    if (AppState.user.injured) {
        viewContainer.innerHTML = `
            <div style="background: rgba(255, 71, 87, 0.05); border: 1px solid rgba(255, 71, 87, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--color-danger); font-weight: bold; font-size: 13px; text-transform: uppercase;">● Lesión Activa</span>
                    <button id="btn-recovery-clear" class="btn btn-outline btn-sm" style="font-size: 11px; padding: 4px 10px; border-color: rgba(0, 245, 212, 0.4); color: var(--color-neon-teal);">Recuperado (Alta)</button>
                </div>
                <p class="text-sm text-secondary" style="margin: 0;"><strong>Detalles:</strong> "${AppState.user.injuryDetails || 'Sin detalles'}"</p>
                <div style="border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 4px; display: flex; flex-direction: column; gap: 6px;">
                    <p class="text-xs text-secondary" style="margin: 0;">¿Asististe hoy a una sesión de Kinesiología?</p>
                    <button id="btn-kinesiology-checkin" class="btn btn-primary btn-sm" style="font-size: 12px; padding: 8px 12px; display: flex; justify-content: center; align-items: center; gap: 6px; width: 100%;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span>Registrar mi Asistencia a Kinesiología</span>
                    </button>
                </div>
            </div>
        `;
        formContainer.classList.add('hidden');
        
        // Agregar manejadores
        viewContainer.querySelector('#btn-recovery-clear').addEventListener('click', () => {
            AppState.user.injured = 0;
            AppState.user.injuryDetails = '';
            saveActiveUserToDatabase();
            renderProfileTab();
            renderDashboard();
        });
        
        viewContainer.querySelector('#btn-kinesiology-checkin').addEventListener('click', () => {
            const att = {
                userId: 'active-user',
                date: new Date().toISOString(),
                type: 'kinesiology',
                notes: `Sesión de Kinesiología por lesión: ${AppState.user.injuryDetails}`
            };
            
            AURA_AI.addAttendance(att);
            fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(att)
            })
            .then(() => {
                alert("✓ Asistencia a Kinesiología registrada con éxito.");
                renderAdminTab();
            })
            .catch(err => console.error("Error guardando asistencia:", err));
        });
    } else {
        viewContainer.innerHTML = `
            <div style="background: rgba(0, 245, 212, 0.05); border: 1px solid rgba(0, 245, 212, 0.2); border-radius: 12px; padding: 16px; text-align: center;">
                <p class="text-sm text-cyan" style="margin: 0; font-weight: bold;">✓ Sin lesiones activas reportadas</p>
                <p class="text-xs text-secondary" style="margin: 4px 0 0 0;">Estás en óptimas condiciones de alto rendimiento.</p>
                <button id="btn-toggle-injury-form" class="btn btn-outline btn-sm" style="margin-top: 10px; font-size: 11px; padding: 6px 12px; border-color: rgba(255, 71, 87, 0.4); color: var(--color-danger);">Reportar Lesión</button>
            </div>
        `;
        formContainer.classList.add('hidden');
        
        viewContainer.querySelector('#btn-toggle-injury-form').addEventListener('click', () => {
            formContainer.classList.toggle('hidden');
        });
    }
}

// Guardar el usuario activo actual en LocalStorage y sincronizarlo con el servidor
function saveActiveUserToDatabase() {
    localStorage.setItem('aura_user_profile', JSON.stringify(AppState.user));
    // Sincronizar en la nube
    fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: AppState.user })
    })
    .then(res => res.json())
    .then(data => console.log("Usuario guardado en la nube:", data))
    .catch(err => console.error("Error sincronizando usuario:", err));
}

// Registrar asistencia de usuario (Estándar o Kinesiología)
function registerUserAttendance(userId, type = 'standard', notes = '') {
    const users = AURA_AI.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const att = {
        userId: userId,
        date: new Date().toISOString(),
        type: type,
        notes: notes || (type === 'kinesiology' ? `Kinesiología: ${user.injuryDetails || 'Lesión'}` : 'Acceso gimnasio general')
    };
    
    // Guardar en la DB local simulada
    AURA_AI.addAttendance(att);
    
    // Guardar en la base de datos de Express (SQLite)
    fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(att)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            playBeep(600, 0.15); // Sonido de éxito
            renderAdminTab();
        }
    })
    .catch(err => {
        console.error("Error sincronizando asistencia:", err);
        // Fallback local exitoso si no hay red
        playBeep(600, 0.15);
        renderAdminTab();
    });
}

// Renderizar el historial de ingresos de asistencia
function renderAttendanceHistory() {
    if (!DOM.adminAttendanceTableBody) return;
    
    fetch('/api/attendance')
    .then(res => res.json())
    .then(data => {
        const list = data.attendance || [];
        const localAtt = AURA_AI.getAttendance();
        
        // Combinar listas sin duplicar
        const allAtt = [...localAtt];
        list.forEach(item => {
            if (!allAtt.some(a => a.id === item.id)) {
                allAtt.push(item);
            }
        });
        
        // Ordenar fecha desc
        allAtt.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        DOM.adminAttendanceTableBody.innerHTML = '';
        if (allAtt.length === 0) {
            DOM.adminAttendanceTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-secondary); padding: 12px; font-size:12px;">No hay ingresos registrados hoy.</td></tr>`;
            return;
        }
        
        allAtt.forEach(att => {
            const users = AURA_AI.getUsers();
            const user = users.find(u => u.id === att.userId);
            const userName = att.userName || (user ? user.name : 'Atleta Desconocido');
            const profileType = att.profileType || (user ? user.profileType : 'estudiante');
            const profileLabel = profileType === 'deportista_seleccionado' ? 'Selección' : 'Estudiante';
            
            const timeStr = new Date(att.date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const typeLabel = att.type === 'kinesiology'
                ? `<span class="cluster-badge" style="background: rgba(123, 44, 191, 0.15); color: var(--color-neon-purple); border: 1px solid rgba(123, 44, 191, 0.3); font-size: 10px;">Kinesiología</span>`
                : `<span class="cluster-badge" style="background: rgba(0, 245, 212, 0.15); color: var(--color-neon-teal); border: 1px solid rgba(0, 245, 212, 0.3); font-size: 10px;">General</span>`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono" style="font-size: 11px;">${timeStr}</td>
                <td style="font-weight: 500; font-size: 12px;">${userName}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">${profileLabel}</td>
                <td style="font-size: 11px; line-height: 1.3;">${typeLabel}<br><span style="font-size: 10px; color:var(--text-muted);">${att.notes || ''}</span></td>
            `;
            DOM.adminAttendanceTableBody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error("Error obteniendo asistencia:", err);
    });
}
