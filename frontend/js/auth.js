document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageDiv = document.getElementById('authMessage');

    if (!email || !password) {
        showMessage('Por favor complete todos los campos', 'error');
        return;
    }

    showMessage('Verificando credenciales...', 'info');

    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403 && data.userData) {
                showMessage(`${data.message} Contacto: admin@ticketera.com`, 'error');
                return;
            }
            throw new Error(data.message || 'Error en la autenticación');
        }

        if (data.success) {
            showMessage(`Bienvenido ${data.user.nombre}!`, 'success');
            
            // Almacenar datos de sesión
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                // Verificar la ruta correcta (asegúrate que panel-principal.html esté en la raíz)
                window.location.href = 'panel-principal.html';
                
                // Si está en otra ubicación, especifica la ruta completa:
                // window.location.href = '/ruta/correcta/panel-principal.html';
            }, 1500);
        } else {
            throw new Error(data.message || 'Error en la autenticación');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message, 'error');
    }
});

// Función para mostrar mensajes (sin cambios)
function showMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;

    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }
}

// Toggle para mostrar/ocultar contraseña (sin cambios)
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const eyeOpen = '../public/assets/img/ojo-abierto.png';
const eyeClosed = '../public/assets/img/ojo.png';

togglePassword.addEventListener('click', () => {
    const isPasswordVisible = passwordInput.type === 'text';
    passwordInput.type = isPasswordVisible ? 'password' : 'text';
    togglePassword.querySelector('img').src = isPasswordVisible ? eyeClosed : eyeOpen;
});