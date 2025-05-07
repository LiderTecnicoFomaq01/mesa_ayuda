document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el parámetro de la URL (?radicado=...)
    const params = new URLSearchParams(window.location.search);
    const radicado = params.get('radicado');

    if (!radicado) {
        document.getElementById('ticket-info').innerHTML = '<p>❗ Ticket no encontrado.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/detalle-ticket/${radicado}`);
        if (!response.ok) throw new Error('Error al obtener los datos');

        const data = await response.json();
        renderTicket(data);
    } catch (error) {
        console.error(error);
        document.getElementById('ticket-info').innerHTML = '<p>❗ Hubo un error cargando el ticket.</p>';
    }
});

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // meses van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function obtenerEstiloEstado(estado) {
    if (!estado) return '';

    const estilosBase = 'color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';

    const colores = {
        'cancelado': 'background-color: red;',
        'resuelto': 'background-color: #4caf50;',
        'finalizado': 'background-color: #2e7d32;',
        'cerrado': 'background-color: green;',
        'pendiente': 'background-color: #ff9800;',
        'en proceso': 'background-color: #03a9f4;',
    };

    const color = colores[estado.toLowerCase()] || 'background-color: #2196f3;';

    return `${color} ${estilosBase}`;
}

function renderTicket(data) {
    const ticket = data.ticket;
    const campos = data.campos;
    const archivos = data.archivos;

    // Datos principales
    document.getElementById('radicado').textContent = ticket.radicado;
    document.getElementById('area').value = ticket.area;
    document.getElementById('categoria').value = ticket.categoria;
    document.getElementById('fecha').value = formatearFecha(ticket.fecha_creacion);
    document.getElementById('radicado_por').value = `${ticket.nombre} ${ticket.apellido}`;
    document.getElementById('email').value = ticket.email;
    document.getElementById('asunto').value = ticket.asunto;
    document.getElementById('descripcion').value = ticket.descripcion;
    // Estado
    const estadoBadge = document.getElementById('estado');
    estadoBadge.textContent = ticket.estado;

    // Aplicar estilos usando la función
    estadoBadge.style.cssText = obtenerEstiloEstado(ticket.estado);


    // Campos adicionales (en la sección de histórico o puedes crear un div específico para ellos)
    const historicoContent = document.getElementById('historico-content');
    if (campos.length > 0) {
        let camposHtml = `<ul>`;
        campos.forEach(campo => {
            camposHtml += `<li><strong>${campo.nombre_campo}:</strong> ${campo.valor_campo || 'N/A'}</li>`;
        });
        camposHtml += `</ul>`;
        historicoContent.innerHTML += camposHtml;
    } else {
        historicoContent.innerHTML += `<p>No hay campos adicionales.</p>`;
    }

    // Archivos adjuntos
    const archivosContainer = document.getElementById('archivos');
    if (archivos.length > 0) {
        let archivosHtml = `<ul>`;
        archivos.forEach(archivo => {
            archivosHtml += `
                <li>
                    <a href="${archivo.ruta_archivo}" target="_blank">${archivo.nombre_archivo}</a>
                </li>
            `;
        });
        archivosHtml += `</ul>`;
        archivosContainer.innerHTML = archivosHtml;
    } else {
        archivosContainer.textContent = 'Sin adjuntos para mostrar';
    }
}

