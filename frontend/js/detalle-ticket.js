document.addEventListener('DOMContentLoaded', async () => {
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
      renderRespuestas(data.respuestas || []);
  
      document.getElementById('btn-finalizar').addEventListener('click', () => {
        confirmarYActualizarEstado(4, 'finalizar');
      });
  
      document.getElementById('btn-cancelar').addEventListener('click', () => {
        confirmarYActualizarEstado(5, 'cancelar');
      });
  
      // Verifica el rol del usuario
      const userData = JSON.parse(localStorage.getItem("userData"));
      const miID = userData?.rol;

      // Mostrar el select si el rol es admin o usuario administrativo
      if (miID === 'admin' || miID === 'usuario administrativo') {
        document.getElementById('estado-group').style.display = 'flex';
      }
  
    } catch (error) {
      console.error(error);
      document.getElementById('ticket-info').innerHTML = '<p>❗ Hubo un error cargando el ticket.</p>';
    }
});
  
function confirmarYActualizarEstado(estado, accion) {
    const confirmar = confirm(`¿Confirmas que deseas ${accion} este ticket?`);
    if (!confirmar) return;
  
    const radicado = new URLSearchParams(window.location.search).get('radicado');
  
    fetch('http://localhost:4000/api/cambiar-estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ radicado, estado }),
    })
      
    window.location.reload(); // Recarga la página justo después
     
}
   
// Nueva función para mostrar las respuestas directamente desde `data.respuestas`
function renderRespuestas(respuestas) {
    const chatMensajes = document.getElementById('chat-mensajes');
    if (!chatMensajes) return;

    const userData = JSON.parse(localStorage.getItem("userData")); // Traer el usuario logueado
    const miID = userData?.id;
    console.log(userData);

    chatMensajes.innerHTML = ''; // Limpiar antes de insertar

    respuestas.forEach(respuesta => {
        const mensajeDiv = document.createElement('div');

        // Comparamos el id del mensaje con el del usuario logueado
        const esMio = String(respuesta.id_usuario) === String(miID);

        mensajeDiv.classList.add('mensaje-chat');
        mensajeDiv.classList.add(esMio ? 'usuario' : 'soporte'); // Clase para el estilo

        const contenidoHTML = `
            <p>${respuesta.mensaje}</p>
            ${respuesta.ruta_archivo ? `<a href="http://localhost:4000/uploads/${respuesta.ruta_archivo}" target="_blank">📁 Ver archivo</a>` : ''}
            <small><strong>${respuesta.nombre_usuario || 'Sistema'} ${respuesta.apellido_usuario || ''}</strong> | ${new Date(respuesta.fecha_respuesta).toLocaleString()}</small>
        `;

        mensajeDiv.innerHTML = contenidoHTML;
        chatMensajes.appendChild(mensajeDiv);
    });

    chatMensajes.scrollTop = chatMensajes.scrollHeight; // Auto-scroll
}

// Función para enviar el mensaje
async function enviarMensaje(radicado, mensaje) {
    const respuesta = {
        radicado,
        mensaje,
        id_usuario: JSON.parse(localStorage.getItem("userData")).id, // ID del usuario logueado
    };

    try {
        const response = await fetch('http://localhost:4000/api/enviar-respuesta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(respuesta),
        });

        if (!response.ok) {
            throw new Error('Error al enviar el mensaje');
        }

        // Después de enviar el mensaje, recargamos la página completa
        window.location.reload(); // Esto recargará toda la página para ver las respuestas actualizadas

    } catch (error) {
        console.error(error);
        alert('Hubo un problema al enviar el mensaje.');
    }
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function obtenerEstiloEstado(estado) {
    const estilosBase = 'color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
    const colores = {
        'cancelado': 'background-color: red;',
        'resuelto': 'background-color: #4caf50;',
        'finalizado': 'background-color: #2e7d32;',
        'cerrado': 'background-color: green;',
        'pendiente': 'background-color: #ff9800;',
        'en proceso': 'background-color: #03a9f4;',
    };
    return `${colores[estado.toLowerCase()] || 'background-color: #2196f3;'} ${estilosBase}`;
}

function renderTicket(data) {
    const ticket = data.ticket;
    const campos = data.campos;
    const archivos = data.archivos;

    // Renderizar info
    document.getElementById('radicado').textContent = ticket.radicado;
    document.getElementById('area').value = ticket.area;
    document.getElementById('categoria').value = ticket.categoria;
    document.getElementById('fecha').value = formatearFecha(ticket.fecha_creacion);
    document.getElementById('radicado_por').value = `${ticket.nombre} ${ticket.apellido}`;
    document.getElementById('email').value = ticket.email;
    document.getElementById('asunto').value = ticket.asunto;
    document.getElementById('descripcion').value = ticket.descripcion;

    const estadoBadge = document.getElementById('estado');
    estadoBadge.textContent = ticket.estado;
    estadoBadge.style.cssText = obtenerEstiloEstado(ticket.estado);

    const historicoContent = document.getElementById('historico-content');
    if (campos.length > 0) {
        let camposHtml = `<ul>`;
        campos.forEach(campo => {
            let valor = campo.valor_campo;
    
            // Convertir booleanos o cadenas tipo 'true'/'false'
            if (valor === true || valor === 'true') {
                valor = 'SI';
            } else if (valor === false || valor === 'false') {
                valor = 'NO';
            } else {
                valor = valor || 'N/A'; // Si está vacío o null
            }
    
            camposHtml += `<li><strong>${campo.nombre_campo}:</strong> ${valor}</li>`;
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
            let rutaNormalizada = archivo.ruta_archivo.replace(/\\/g, '/');
            const indexUploads = rutaNormalizada.indexOf('uploads/');
            if (indexUploads !== -1) {
                rutaNormalizada = rutaNormalizada.substring(indexUploads + 'uploads/'.length);
            }

            const downloadUrl = `http://localhost:4000/uploads/${encodeURIComponent(rutaNormalizada)}`;

            archivosHtml += `
                <li style="margin-bottom: 15px;">
                    <a href="#" onclick="previsualizarArchivo('${rutaNormalizada}', '${nombre}'); return false;" 
                    style="text-decoration: underline; color: #007bff; cursor: pointer;">
                        <i class="fas fa-file"></i> ${nombre}
                    </a>
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

        document.querySelectorAll('.evidencia-descargar').forEach(btn => {
            btn.addEventListener('click', async function () {
                const originalText = this.textContent;
                this.textContent = "Preparando...";
                this.disabled = true;

                try {
                    const response = await fetch(this.dataset.url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const blob = await response.blob();
                    const tempLink = document.createElement('a');
                    tempLink.href = URL.createObjectURL(blob);
                    tempLink.download = this.dataset.filename;
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

    // Manejador de envío de respuesta
    const respuestaForm = document.getElementById('form-respuesta');
    const submitBtn = respuestaForm.querySelector('button[type="submit"]');

    respuestaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener datos del usuario
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (!userData || !userData.id) {
            alert('Usuario no autenticado');
            window.location.href = '/login.html';
            return;
        }

        // Configurar botón durante el envío
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span class="spinner"></span>
            <span class="button-text">Enviando...</span>
        `;

        const formData = new FormData(respuestaForm);
        formData.append('id_ticket', ticket.radicado);
        formData.append('id_usuario', userData.id);

        // Mensaje de carga
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = `<p>Enviando respuesta...</p>`;
        respuestaForm.prepend(loadingMessage);

        try {
            const response = await fetch('http://localhost:4000/api/responder', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                },
                body: formData
            });

            const result = await response.json();
            loadingMessage.remove();

            if (!response.ok) {
                throw new Error(result.message || 'Error al enviar la respuesta');
            }

            // Mensaje de éxito
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `<p>Respuesta enviada correctamente</p>`;
            respuestaForm.prepend(successMessage);

            setTimeout(() => {
                successMessage.remove();
                window.location.reload();
            }, 2000);

        } catch (error) {
            loadingMessage.remove();

            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = `Error: ${error.message}`;
            respuestaForm.prepend(errorMessage);

            setTimeout(() => errorMessage.remove(), 5000);
        } finally {
            // Restaurar el botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

function previsualizarArchivo(ruta, nombre) {
    const extension = nombre.split('.').pop().toLowerCase();
    const fileUrl = `http://localhost:4000/uploads/${encodeURIComponent(ruta)}`;

    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'txt'].includes(extension)) {
        window.open(fileUrl, '_blank');
    } else {
        alert(`El archivo ${nombre} no se puede previsualizar.`);
    }
}