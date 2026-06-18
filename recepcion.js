document.addEventListener('DOMContentLoaded', () => {
    const lectorInput = document.getElementById('lector');
    const statusBox = document.getElementById('status-box');
    let isProcessing = false;

    // Asegurar que el input siempre tenga el foco para no perder escaneos
    // Incluso si el usuario hace click en otra parte de la pantalla
    document.addEventListener('click', () => {
        lectorInput.focus();
    });

    // Validar y mantener el foco activamente por si el navegador lo quita
    setInterval(() => {
        if (document.activeElement !== lectorInput) {
            lectorInput.focus();
        }
    }, 1000);

    lectorInput.addEventListener('keydown', (e) => {
        // Los lectores USB envían un 'Enter' al final de la lectura
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const token = lectorInput.value.trim();
            lectorInput.value = ''; // Limpiar inmediatamente el input para el siguiente escaneo (10 per/min)
            
            if (!token || isProcessing) return;

            processCheckIn(token);
        }
    });

    function processCheckIn(token) {
        isProcessing = true;
        statusBox.className = 'status-box status-idle';
        statusBox.textContent = 'Procesando...';

        fetch('http://localhost:3000/api/asistencia/check-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                statusBox.className = 'status-box status-success';
                statusBox.textContent = '¡Acceso Concedido!';
            } else {
                statusBox.className = 'status-box status-error';
                statusBox.textContent = 'Error: ' + data.error;
            }
            
            // Regresar al estado inactivo visualmente
            setTimeout(() => {
                statusBox.className = 'status-box status-idle';
                statusBox.textContent = 'Listo. Escanee el código QR...';
                isProcessing = false;
            }, 1500); // 1.5 segundos para no ralentizar el flujo
        })
        .catch(err => {
            statusBox.className = 'status-box status-error';
            statusBox.textContent = 'Error de conexión con el servidor.';
            
            setTimeout(() => {
                statusBox.className = 'status-box status-idle';
                statusBox.textContent = 'Listo. Escanee el código QR...';
                isProcessing = false;
            }, 1500);
        });
    }
});
