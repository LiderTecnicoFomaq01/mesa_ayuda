const btn = document.getElementById('changeBtn');
const messageDiv = document.getElementById('changeMessage');
const primerNombreInput = document.getElementById('primerNombre');
const segundoNombreInput = document.getElementById('segundoNombre');
const primerApellidoInput = document.getElementById('primerApellido');
const segundoApellidoInput = document.getElementById('segundoApellido');
const emailInput = document.getElementById('email');
const celularInput = document.getElementById('celular');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const aceptaDatosCheckbox = document.getElementById('aceptaDatos');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const eyeOpen = '../public/assets/img/ojo-abierto.png';
const eyeClosed = '../public/assets/img/ojo.png';

btn.disabled = true;

function updateButtonState() {
    const requiredFilled = primerNombreInput.value.trim() && primerApellidoInput.value.trim() && emailInput.value.trim() && celularInput.value.trim() && newPasswordInput.value.trim() && confirmPasswordInput.value.trim();
    btn.disabled = !(requiredFilled && aceptaDatosCheckbox.checked);
}

[primerNombreInput, primerApellidoInput, emailInput, celularInput, newPasswordInput, confirmPasswordInput].forEach(el => {
    el.addEventListener('input', updateButtonState);
});
aceptaDatosCheckbox.addEventListener('change', updateButtonState);

btn.addEventListener('click', async () => {
    const primer_nombre = primerNombreInput.value.trim();
    const segundo_nombre = segundoNombreInput.value.trim();
    const primer_apellido = primerApellidoInput.value.trim();
    const segundo_apellido = segundoApellidoInput.value.trim();
    const email = emailInput.value.trim();
    const celular = celularInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const acepta_datos = aceptaDatosCheckbox.checked;

    if (!primer_nombre || !primer_apellido || !email || !celular || !newPassword || !confirmPassword || !acepta_datos) {
        showMessage('Por favor complete los campos obligatorios', 'error');
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
        const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                newPassword,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                email,
                celular,
                acepta_datos
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        showMessage('Datos guardados correctamente', 'success');
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
