if (typeof API_URL === 'undefined') {
    var API_URL = 'http://localhost:4000/api/filtros'; // Usamos 'var' para que sea accesible globalmente
}

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

    const userData = JSON.parse(localStorage.getItem("userData"));
    const miID = userData.id;
    const esDueno = miID === data.ticket.id_usuario;
    const estadoTicket = data.ticket.estado.toLowerCase();

    if (esDueno) {
      if (estadoTicket === 'resuelto') {
        document.getElementById('btn-finalizar').style.display = '';
        document.getElementById('btn-pendiente').style.display = '';
      }
    }

    document.getElementById('btn-finalizar').addEventListener('click', () => {
      confirmarYActualizarEstado(4, 'finalizar');
    });

    document.getElementById('btn-pendiente').addEventListener('click', () => {
      confirmarYActualizarEstado(2, 'pendiente');
    });

    await configurarCambioDeEstado(radicado);

    // --- Cierre de modal finalizar---
    const modalSatisfaccion = document.getElementById('modal-satisfaccion');
    const cerrarBtn = document.querySelector('.cerrar-satisfaccion');

    if (modalSatisfaccion && cerrarBtn) {
      cerrarBtn.addEventListener('click', () => {
        modalSatisfaccion.style.display = 'none';
      });
    } else {
      console.warn('No se encontró el modal o el botón de cerrar');
    }

    // --- Envío de la encuesta y cambio de estado a "finalizar" ---
    const formEncuesta = document.getElementById('formEncuestaSatisfaccion');
    formEncuesta.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Todos los campos tienen `required`, así que si llega aquí, están llenos
      const formData = new FormData(formEncuesta);
      const respuestas = Object.fromEntries(formData.entries());
      // (Opcional) puedes enviar estas respuestas al backend si tu endpoint lo admite

      try {
        const cambio = await fetch('http://localhost:4000/api/cambiar-estado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ radicado, estado: 4 })
        });
        if (!cambio.ok) throw new Error('Error al cambiar el estado');
        // Cierra el modal al finalizar
        modalSatisfaccion.style.display = 'none';
        // (Opcional) recarga detalles o redirige
        location.reload();
      } catch (err) {
        console.error(err);
        alert('Hubo un error al enviar la encuesta o cambiar el estado.');
      }
    });

    // --- Cierre de modal rechazar---
    const modalRechazar = document.getElementById('modal-rechazar');
    const rechazarCerrarBtn = document.querySelector('.cerrar-rechazar');

    if (modalRechazar && rechazarCerrarBtn) {
    rechazarCerrarBtn.addEventListener('click', () => {
        modalRechazar.style.display = 'none';
    });
    } else {
    console.warn('No se encontró el modal de rechazar o el botón de cerrar');
    }


  } catch (error) {
    console.error(error);
    document.getElementById('ticket-info').innerHTML = '<p>❗ Hubo un error cargando el ticket.</p>';
  }
});

async function configurarCambioDeEstado(radicado) {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const miID = userData?.rol;

  const estadoGroup = document.getElementById('estado-group');
  const btnComentario = document.getElementById('btnComentarioInterno');
  const btnRedireccionar = document.getElementById('btnRedireccionar');

  if (miID === 'admin' || miID === 'usuario administrativo') {
    if (estadoGroup) estadoGroup.style.display = 'flex';
    if (btnComentario) btnComentario.style.display = 'flex';
    if (btnRedireccionar) btnRedireccionar.style.display = 'inline-flex';

    // Cargar opciones del select
    await cargarEstados();

    const selectEstado = document.getElementById('filtro-estado');
    selectEstado.addEventListener('change', async () => {
      const nuevoEstado = selectEstado.value;
      if (!nuevoEstado) return;

      const confirmar = confirm('¿Confirmas que deseas cambiar el estado del ticket?');
      if (!confirmar) return;

      await fetch('http://localhost:4000/api/cambiar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ radicado, estado: nuevoEstado }),
      });

      setTimeout(() => {
        window.location.reload();
      }, 300);
    });

  } else {
    if (estadoGroup) estadoGroup.style.display = 'none';
    if (btnComentario) btnComentario.style.display = 'none';
    if (btnRedireccionar) btnRedireccionar.style.display = 'none';
  }
}

document.getElementById('btnAplicarRedireccion').addEventListener('click', async () => {
  const areaSelect = document.getElementById('combo-area');
  const categoriaSelect = document.getElementById('combo-categoria');
  const responsableSelect = document.getElementById('combo-responsable');
  const justificacion = document.getElementById('justificacion').value.trim();

  const areaId = areaSelect.value;
  const categoriaId = categoriaSelect.value;
  const usuarioId = responsableSelect.value;

  if (!areaId || !categoriaId || !usuarioId || !justificacion) {
    alert('Faltan campos por llenar. Por favor complete todos los campos incluyendo la justificación.');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get('radicado');

  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!ticketId || !userData || !userData.id) {
    alert('No se pudo obtener el ID del ticket o el usuario.');
    return;
  }

  try {
    // 1. Redireccionamiento
    const redireccionResponse = await fetch('http://localhost:4000/api/redireccionar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticketId,
        usuarioId,
        categoriaId
      })
    });

    const result = await redireccionResponse.json();

    if (!redireccionResponse.ok) {
      alert(`Error al redireccionar: ${result.error}`);
      return;
    }

    // 2. Enviar la justificación como respuesta interna
    const formData = new FormData();
    formData.append('id_ticket', ticketId);
    formData.append('id_usuario', userData.id);
    formData.append('mensaje', justificacion);
    formData.append('interno', true);

    const respuestaResponse = await fetch('http://localhost:4000/api/responder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userData.token}`
      },
      body: formData
    });

    const respuestaResult = await respuestaResponse.json();

    if (!respuestaResponse.ok) {
      throw new Error(respuestaResult.message || 'Error al guardar la justificación');
    }

    alert('Ticket redireccionado y justificación guardada con éxito.');
    document.getElementById('modalRedireccion').style.display = 'none';
    window.location.reload();

  } catch (error) {
    console.error('Error:', error);
    alert('Error inesperado durante la redirección o al guardar la justificación.');
  }
});


async function cargarEstados() {
    const selectEstado = document.getElementById('filtro-estado');
    if (!selectEstado) return;
  
    try {
      const res = await fetch(`${API_URL}/estados`);
      if (!res.ok) throw new Error('Error al cargar estados');
      const data = await res.json();
  
      selectEstado.innerHTML = '<option value="">Seleccione un estado</option>';
      data.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.nombre_estado;
        selectEstado.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar estados:', error);
    }
}
  
async function confirmarYActualizarEstado(estado, accion) {
    const confirmar = confirm(`¿Confirmas que deseas dejar en ${accion} este ticket?`);
    if (!confirmar) return;

    const radicado = new URLSearchParams(window.location.search).get('radicado');

    try {

        if (confirmar) {
            // Sólo mostramos el modal de satisfacción si la acción es 'finalizar'
            if (accion === 'finalizar') {
                document.getElementById('ticket_id').value = radicado;
                document.getElementById('modal-satisfaccion').style.display = 'flex';
                return;
            }
            if (accion === 'pendiente') {
                document.getElementById('ticket_id').value = radicado;
                document.getElementById('modal-rechazar').style.display = 'flex';
                return;
            }

            window.location.reload();
        } else {
            alert('Hubo un error al cambiar el estado del ticket.');
        }
    } catch (error) {
        console.error(error);
        alert('Error de red al cambiar el estado.');
    }
}
   
// Nueva función para mostrar las respuestas directamente desde `data.respuestas`
let mostrarSoloInternos = false;

function renderRespuestas(respuestas) {
    const chatMensajes = document.getElementById('chat-mensajes');
    if (!chatMensajes) return;

    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    const miID = userData.id;
    const miRol = userData.rol;

    // ¿Este usuario puede ver internos?
    const puedeVerInterno = miRol === 'admin' || miRol === 'usuario administrativo';

    // --- 1) Inyectar el botón de toggle (solo si tiene permisos) ---
    let toggleBtn = document.getElementById('toggleInterno');

    if (puedeVerInterno) {
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'toggleInterno';
            toggleBtn.classList.add('btn-toggle-interno');
            toggleBtn.innerHTML = '<i class="fas fa-lock"></i>';
            chatMensajes.appendChild(toggleBtn);
        }

        // Asegúrate de no duplicar el listener
        toggleBtn.onclick = () => {
            mostrarSoloInternos = !mostrarSoloInternos;
            toggleBtn.innerHTML = mostrarSoloInternos
                ? '<i class="fas fa-lock-open"></i>'
                : '<i class="fas fa-lock"></i>';
            renderRespuestas(respuestas);
        };
    }


    // --- 2) Limpiar mensajes dejando el botón intacto ---
    // Extraemos el botón (si existe) antes de limpiar:
    if (toggleBtn) chatMensajes.removeChild(toggleBtn);
    chatMensajes.innerHTML = '';
    if (toggleBtn) chatMensajes.appendChild(toggleBtn);

    // --- 3) Renderizar cada respuesta según el filtro ---
    respuestas.forEach(respuesta => {
        const esInterno = Number(respuesta.interno) === 1;

        // Si pedimos SOLO internos...
        if (mostrarSoloInternos) {
            // ...pero no es interno, lo saltamos
            if (!esInterno) return;
            // y si no tiene permiso, también
            if (!puedeVerInterno) return;
        } else {
            // modo “todos”: ocultar internos si no tiene permiso
            if (esInterno && !puedeVerInterno) return;
        }

        const mensajeDiv = document.createElement('div');
        const esMio = String(respuesta.id_usuario) === String(miID);

        mensajeDiv.classList.add('mensaje-chat', esMio ? 'usuario' : 'soporte');
        if (esInterno) mensajeDiv.classList.add('interno');

        mensajeDiv.innerHTML = `
            ${esInterno ? '<span class="etiqueta-interno">🔒 Comentario interno</span>' : ''}
            <p>${respuesta.mensaje}</p>
            ${respuesta.ruta_archivo 
                ? `<a href="http://localhost:4000/uploads/${respuesta.ruta_archivo}" target="_blank">📁 Ver archivo</a>` 
                : ''}
            <small>
              <strong>${respuesta.nombre_usuario || 'Sistema'} ${respuesta.apellido_usuario || ''}</strong> | 
              ${new Date(respuesta.fecha_respuesta).toLocaleString()}
            </small>
        `;
        chatMensajes.appendChild(mensajeDiv);
    });

    chatMensajes.scrollTop = chatMensajes.scrollHeight;
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

const comentarioInternoBtn = document.getElementById('btnComentarioInterno');

// Lógica para botón de comentario interno
comentarioInternoBtn.addEventListener('click', async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (!userData || !userData.id) {
        alert('Usuario no autenticado');
        window.location.href = '/login.html';
        return;
    }

    comentarioInternoBtn.disabled = true;
    const originalText = comentarioInternoBtn.innerHTML;
    comentarioInternoBtn.innerHTML = `
        <span class="spinner"></span>
        <span class="button-text">Enviando...</span>
    `;

    const formData = new FormData(respuestaForm);
    formData.append('id_ticket', ticket.radicado);
    formData.append('id_usuario', userData.id);
    formData.append('interno', true); // <-- Este es el campo clave

    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.innerHTML = `<p>Enviando comentario interno...</p>`;
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
            throw new Error(result.message || 'Error al enviar el comentario interno');
        }

        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `<p>Comentario interno enviado correctamente</p>`;
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
        comentarioInternoBtn.disabled = false;
        comentarioInternoBtn.innerHTML = originalText;
    }
});
}

// Cargar áreas en combo-area
async function cargarAreasRedireccion() {
    const selectArea = document.getElementById('combo-area');
    selectArea.innerHTML = '<option value="">Cargando áreas…</option>';

    try {
        const res = await fetch(`${API_URL}/areas`);
        if (!res.ok) throw new Error('Error al cargar áreas');
        const data = await res.json();

        selectArea.innerHTML = '<option value="">Seleccione un área</option>';
        data.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.nombre;
            selectArea.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar áreas:', error);
        selectArea.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// Cargar categorías en combo-categoria según área seleccionada
async function cargarCategoriasRedireccion(idArea = '') {
    const selectCategoria = document.getElementById('combo-categoria');
    selectCategoria.innerHTML = '<option value="">Cargando categorías…</option>';
    selectCategoria.disabled = true;

    try {
        let url = `${API_URL}/categorias`;
        if (idArea) url += `?area_id=${idArea}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar categorías');
        const data = await res.json();

        selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            selectCategoria.appendChild(option);
        });

        selectCategoria.disabled = false;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        selectCategoria.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// Cargar usuarios en combo-responsable según categoría seleccionada
async function cargarUsuariosRedireccion(idCategoria = '') {
    const selectUsuarios = document.getElementById('combo-responsable');
    selectUsuarios.innerHTML = '<option value="">Cargando responsables…</option>';
    selectUsuarios.disabled = true;

    try {
        let url = `${API_URL}/usuarios`;
        if (idCategoria) url += `?categoria_id=${idCategoria}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar usuarios');
        const data = await res.json();

        selectUsuarios.innerHTML = '<option value="">Seleccione un responsable</option>';
        data.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.primer_nombre} ${usuario.primer_apellido}`;
            selectUsuarios.appendChild(option);
        });

        selectUsuarios.disabled = false;
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        selectUsuarios.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// Mostrar modal y cargar áreas
document.getElementById('btnRedireccionar').addEventListener('click', async () => {
    document.getElementById('modalRedireccion').style.display = 'flex';
    await cargarAreasRedireccion();

    // Resetear combos dependientes
    const comboCategoria = document.getElementById('combo-categoria');
    const comboResponsable = document.getElementById('combo-responsable');
    comboCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
    comboResponsable.innerHTML = '<option value="">Seleccione un responsable</option>';
    comboCategoria.disabled = true;
    comboResponsable.disabled = true;
});

// Evento para cargar categorías al seleccionar un área
document.getElementById('combo-area').addEventListener('change', async (e) => {
    const areaId = e.target.value;

    const comboResponsable = document.getElementById('combo-responsable');
    comboResponsable.innerHTML = '<option value="">Seleccione un responsable</option>';
    comboResponsable.disabled = true;

    if (areaId) {
        await cargarCategoriasRedireccion(areaId);
    } else {
        const comboCategoria = document.getElementById('combo-categoria');
        comboCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
        comboCategoria.disabled = true;
    }
});

// Evento para cargar usuarios al seleccionar una categoría
document.getElementById('combo-categoria').addEventListener('change', async (e) => {
    const categoriaId = e.target.value;

    if (categoriaId) {
        await cargarUsuariosRedireccion(categoriaId);
    } else {
        const comboResponsable = document.getElementById('combo-responsable');
        comboResponsable.innerHTML = '<option value="">Seleccione un responsable</option>';
        comboResponsable.disabled = true;
    }
});

document.getElementById('btnCerrarModal').addEventListener('click', () => {
  document.getElementById('modalRedireccion').style.display = 'none';
});

function previsualizarArchivo(ruta, nombre) {
    const extension = nombre.split('.').pop().toLowerCase();
    const fileUrl = `http://localhost:4000/uploads/${encodeURIComponent(ruta)}`;

    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'txt'].includes(extension)) {
        window.open(fileUrl, '_blank');
    } else {
        alert(`El archivo ${nombre} no se puede previsualizar.`);
    }
}