const btn = document.getElementById('changeBtn');
const messageDiv = document.getElementById('changeMessage');

btn.addEventListener('click', async () => {
    const newPassword = document.getElementById('newPassword').value.trim();
    if (!newPassword) {
        showMessage('Debe ingresar una nueva contraseña', 'error');
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
