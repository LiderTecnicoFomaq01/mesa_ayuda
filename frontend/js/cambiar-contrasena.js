const btn = document.getElementById('changeBtn');
const messageDiv = document.getElementById('changeMessage');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const eyeOpen = '../public/assets/img/ojo-abierto.png';
const eyeClosed = '../public/assets/img/ojo.png';

btn.addEventListener('click', async () => {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!newPassword || !confirmPassword) {
        showMessage('Debe completar ambos campos', 'error');
        return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        showMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un caracter especial', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }

    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch('http://localhost:4000/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        showMessage('Contraseña actualizada', 'success');
        setTimeout(() => {
            window.location.href = 'panel-principal.html';
        }, 1500);
    } catch (err) {
        console.error(err);
        showMessage(err.message, 'error');
    }
});

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
}

// Toggle para mostrar/ocultar la nueva contraseña
toggleNewPassword.addEventListener('click', () => {
    const isVisible = newPasswordInput.type === 'text';
    newPasswordInput.type = isVisible ? 'password' : 'text';
    toggleNewPassword.querySelector('img').src = isVisible ? eyeClosed : eyeOpen;
});

// Toggle para mostrar/ocultar la confirmación
toggleConfirmPassword.addEventListener('click', () => {
    const isVisible = confirmPasswordInput.type === 'text';
    confirmPasswordInput.type = isVisible ? 'password' : 'text';
    toggleConfirmPassword.querySelector('img').src = isVisible ? eyeClosed : eyeOpen;
});
