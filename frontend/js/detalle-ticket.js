document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el parámetro de la URL (?radicado=...)
    const params = new URLSearchParams(window.location.search);
    const radicado = params.get('radicado');

    if (!radicado) {
        document.getElementById('ticket-info').innerHTML = '<p>❗ Ticket no encontrado.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/detalle-ticket/${encodeURIComponent(radicado)}`);
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
    estadoBadge.style.cssText = obtenerEstiloEstado(ticket.estado);

    // Campos adicionales
    const historicoContent = document.getElementById('historico-content');
    if (campos.length > 0) {
        let camposHtml = `<ul>`;
        campos.forEach(campo => {
            camposHtml += `<li>${campo.nombre_campo}: ${campo.valor_campo || 'N/A'}</li>`;
        });
        camposHtml += `</ul>`;
        historicoContent.innerHTML += camposHtml;
    } else {
        historicoContent.innerHTML += `<p>No hay campos adicionales.</p>`;
    }

    // Archivos
    const archivosContainer = document.getElementById('archivos');

    if (archivos.length > 0) {
        let archivosHtml = `<ul style="list-style: none; padding: 0;">`;

        archivos.forEach((archivo) => {
            const nombre = archivo.nombre_archivo;
        
            // Normaliza la ruta y extrae la parte después de 'uploads/'
            let rutaNormalizada = archivo.ruta_archivo.replace(/\\/g, '/');
            const indexUploads = rutaNormalizada.indexOf('uploads/');
            if (indexUploads !== -1) {
                rutaNormalizada = rutaNormalizada.substring(indexUploads + 'uploads/'.length);
            }

            const downloadUrl = `http://localhost:4000/uploads/${encodeURIComponent(rutaNormalizada)}`;

            archivosHtml += `
                <li style="margin-bottom: 15px;">
                    <!-- Enlace de previsualización -->
                    <a href="#" onclick="previsualizarArchivo('${rutaNormalizada}', '${nombre}'); return false;" 
                    style="text-decoration: underline; color: #007bff; cursor: pointer;">
                        <i class="fas fa-file"></i> ${nombre}
                    </a>
                    
                    <!-- Botón de descarga -->
                    <button class="evidencia-descargar"
                            data-url="${downloadUrl}"
                            data-filename="${nombre}"
                            style="margin-left: 15px; padding: 5px 10px; background-color: #2196f3; color: white; border-radius: 6px; border: none;">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                </li>
            `;
        });

        archivosHtml += `</ul>`;
        archivosContainer.innerHTML = archivosHtml;

        // Manejador de descarga para los botones
        document.querySelectorAll('.evidencia-descargar').forEach(btn => {
            btn.addEventListener('click', async function() {
                const originalText = this.textContent;
                this.textContent = "Preparando...";
                this.disabled = true;
                
                try {
                    const url = this.dataset.url;
                    const filename = this.dataset.filename;
                    
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const blob = await response.blob();
                    const tempLink = document.createElement('a');
                    tempLink.href = URL.createObjectURL(blob);
                    tempLink.download = filename;
                    tempLink.style.display = 'none';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    setTimeout(() => {
                        document.body.removeChild(tempLink);
                        URL.revokeObjectURL(tempLink.href);
                    }, 100);
                    
                } catch (error) {
                    console.error("Descarga fallida:", error);
                    alert(`No se pudo descargar: ${error.message}`);
                } finally {
                    this.textContent = originalText;
                    this.disabled = false;
                }
            });
        });
        
    } else {
        archivosContainer.textContent = 'Sin adjuntos para mostrar';
    }
}

// Función para previsualizar el archivo en una nueva pestaña
function previsualizarArchivo(ruta, nombre) {
    const extension = nombre.split('.').pop().toLowerCase();
    const fileUrl = `http://localhost:4000/uploads/${encodeURIComponent(ruta)}`;

    // Verificar si es un archivo soportado (por ejemplo, PDF)
    if (extension === 'pdf') {
        window.open(fileUrl, '_blank'); // Esto abre el PDF en el visor del navegador
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
        window.open(fileUrl, '_blank'); // Esto abrirá las imágenes en el visor del navegador
    } else if (extension === 'txt') {
        window.open(fileUrl, '_blank'); // Abrir archivos de texto en una nueva pestaña
    } else {
        // Si no se puede previsualizar, mostrar un mensaje
        alert(`El archivo ${nombre} no se puede previsualizar.`);
    }
}

