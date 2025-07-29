console.log('Script crear-solicitud.js iniciado');

// Función principal
async function initCrearSolicitud() {
    console.log('Inicializando módulo de creación de solicitud');
    
    try {
        const contenedor = document.getElementById('contenedor-areas');
        if (!contenedor) throw new Error('Contenedor de áreas no encontrado');

        contenedor.innerHTML = '<div class="cargando">Cargando áreas disponibles...</div>';

        console.log('Solicitando áreas al API...');
        const response = await fetch(`${BASE_URL}/api/areas`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        const areas = await response.json();
        console.log('Áreas recibidas:', areas);

        renderAreas(areas, contenedor);
        initModalFormulario();

    } catch (error) {
        console.error('Error en initCrearSolicitud:', error);
        mostrarError(error.message);
    }
}

// Renderiza áreas como botones con contenedores de categorías
function renderAreas(areas, contenedor) {
    contenedor.innerHTML = '';

    if (!Array.isArray(areas)) {
        throw new Error('Formato de áreas inválido');
    }

    areas.forEach(area => {
        if (!area.id || !area.nombre) {
            console.warn('Área con formato inválido:', area);
            return;
        }

        const divArea = document.createElement('div');
        divArea.className = 'area-bloque';

        const boton = document.createElement('button');
        boton.className = 'boton-area';
        boton.dataset.areaId = area.id;

        // Insertar nombre arriba y descripción abajo
        boton.innerHTML = `<div><strong>${area.nombre}</strong></div><div class="descripcion">${area.descripcion}</div>`;

        const contenedorCategorias = document.createElement('div');
        contenedorCategorias.className = 'categorias-contenedor';
        contenedorCategorias.id = `categorias-${area.id}`;

        boton.addEventListener('click', async (event) => {
            // Cerrar cualquier contenedor de categorías abierto previamente
            const contenedoresAbiertos = document.querySelectorAll('.categorias-contenedor');
            contenedoresAbiertos.forEach(contenedorAbierto => {
                if (contenedorAbierto !== contenedorCategorias) {
                    contenedorAbierto.style.display = 'none';
                }
            });

            // Alternar la visibilidad del contenedor de categorías actual
            if (contenedorCategorias.style.display === 'block') {
                contenedorCategorias.style.display = 'none';
            } else {
                contenedorCategorias.style.display = 'block';
                seleccionarArea(area, event.currentTarget);
                await cargarCategorias(area.id, contenedorCategorias);
            }
        });

        divArea.appendChild(boton);
        divArea.appendChild(contenedorCategorias);
        contenedor.appendChild(divArea);
    });
}

// Marca botón seleccionado y guarda en localStorage
function seleccionarArea(area, botonSeleccionado) {
    console.log('Área seleccionada:', area);

    document.querySelectorAll('.boton-area').forEach(boton => {
        boton.classList.remove('seleccionado');
    });

    botonSeleccionado.classList.add('seleccionado');

    localStorage.setItem('areaSeleccionada', JSON.stringify(area));
}

async function cargarCategorias(idArea, contenedor) {
    // Oculta todos los demás contenedores de categorías
    document.querySelectorAll('.categorias-contenedor').forEach(c => {
        c.innerHTML = '';
    });

    contenedor.innerHTML = '<div class="cargando">Cargando categorías...</div>';

    try {
        const response = await fetch(`${BASE_URL}/api/areas/${idArea}/categorias`);

        if (!response.ok) throw new Error('Error al obtener categorías');

        const categorias = await response.json();
        console.log('Lista completa de categorías recibidas:', categorias);

        contenedor.innerHTML = '';

        if (!Array.isArray(categorias) || categorias.length === 0) {
            contenedor.innerHTML = '<p>No hay categorías registradas.</p>';
            return;
        }

        // Crear botones por cada categoría
        categorias.forEach(cat => {
            const boton = document.createElement('button');
            boton.className = 'boton-categoria';
            boton.textContent = cat.nombre;
            
            console.log('Creando botón para categoría:', {
                id: cat.id, 
                nombre: cat.nombre
            });

            boton.addEventListener('click', () => {
                console.log('Categoría clickeada - ID:', cat.id);

                localStorage.setItem('categoriaSeleccionada', JSON.stringify(cat));

                // Abrir modal
                const modal = document.getElementById('modalFormulario');
                modal.style.display = 'block';
                
                // Cargar el formulario dinámico
                cargarFormulario(cat.id);
            });
            contenedor.appendChild(boton);
        });

    } catch (error) {
        console.error('Error cargando categorías:', error);
        contenedor.innerHTML = `<p class="error-categoria">${error.message}</p>`;
    }
}

// Muestra mensaje de error
function mostrarError(mensaje) {
    const contenedor = document.getElementById('contenedor-areas') || document.body;
    contenedor.innerHTML = `
        <div class="error-area">
            <p>${mensaje}</p>
            <button onclick="window.location.reload()">Reintentar</button>
        </div>
    `;
}

// Inicializar el modal del formulario
function initModalFormulario() {
    const modal = document.getElementById('modalFormulario');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!modal || !closeBtn) return;
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Función para cargar el formulario dinámico
async function cargarFormulario(idCategoria) {
    const formularioContainer = document.getElementById('formulario-container');
    const formTitle = document.querySelector('.form-title');
    
    if (!idCategoria) {
        formularioContainer.innerHTML = '<p class="error-message">No se ha especificado categoría</p>';
        return;
    }

    try {
        // 1. Obtener datos de la categoría desde localStorage
        const categoriaStorage = localStorage.getItem('categoriaSeleccionada');
        const categoria = categoriaStorage ? JSON.parse(categoriaStorage) : null;
        
        // 2. Actualizar título con el nombre de la categoría en mayúsculas
        if (categoria?.nombre) {
            formTitle.textContent = categoria.nombre.toUpperCase();
        } else {
            formTitle.textContent = 'FORMULARIO DE TICKET'; // Fallback
        }

        // 3. Obtener campos del formulario
        const response = await fetch(`${BASE_URL}/api/areas/${idCategoria}/campos`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener campos');
        }
        
        const { data: campos } = await response.json();
        
        if (!campos || campos.length === 0) {
            formularioContainer.innerHTML = '<p class="error-message">No hay campos configurados para esta categoría</p>';
            return;
        }
        
        // Crear formulario dinámico
        const form = document.createElement('form');
        form.id = 'dynamic-form';
        form.enctype = 'multipart/form-data';
        
        // Campos dinámicos según la categoría
        campos.forEach(campo => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'form-field';
            
            let input;
            
            switch(campo.tipo_campo) {
                case 'texto':
                    fieldContainer.innerHTML = `
                        <label for="field-${campo.id}">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                        <input type="text" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''} placeholder="Ingrese ${campo.nombre_campo.toLowerCase()}">
                    `;
                    break;
                    
                case 'numero':
                    fieldContainer.innerHTML = `
                        <label for="field-${campo.id}">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                        <input type="number" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''} placeholder="Ingrese ${campo.nombre_campo.toLowerCase()}">
                    `;
                    break;
                    
                case 'fecha':
                    fieldContainer.innerHTML = `
                        <label for="field-${campo.id}">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                        <input type="date" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''}>
                    `;
                    break;
                    
                case 'booleano':
                    fieldContainer.innerHTML = `
                        <div class="checkbox-group">
                            <p class="checkbox-question">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</p>
                            <div class="checkbox-container">
                                <input type="checkbox" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''}>
                                <label for="field-${campo.id}" class="checkbox-label">Marcar si aplica</label>
                            </div>
                        </div>
                    `;
                    break;
                
                case 'textarea':
                    fieldContainer.innerHTML = `
                        <div class="textarea-group">
                            <label for="field-${campo.id}" class="textarea-label">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                            <textarea id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''} rows="4" class="textarea-input" placeholder="Escribe aquí..."></textarea>
                        </div>
                    `;
                    break;
                    
                case 'archivo':
                    fieldContainer.innerHTML = `
                        <label for="field-${campo.id}">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                        <div class="file-input-container">
                            <span class="file-input-button">Seleccionar archivo</span>
                            <span class="file-input-name">Ningún archivo seleccionado</span>
                            <input type="file" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''} multiple>
                        </div>
                    `;
                    
                    // Agregar evento para mostrar nombre de archivo
                    const fileInput = fieldContainer.querySelector('input[type="file"]');
                    const fileNameSpan = fieldContainer.querySelector('.file-input-name');
                    
                    fileInput.addEventListener('change', (e) => {
                        const names = Array.from(e.target.files).map(f => f.name).join(', ');
                        fileNameSpan.textContent = names || 'Ningún archivo seleccionado';
                    });
                    break;
                
                case 'email':
                    fieldContainer.innerHTML = `
                        <div class="email-group">
                            <label for="field-${campo.id}" class="email-label">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                            <input type="email" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''} class="email-input">
                        </div>
                    `;
                    
                    // Validación de email
                    const emailInput = fieldContainer.querySelector('input[type="email"]');
                    emailInput.addEventListener('invalid', function (event) {
                        if (emailInput.validity.typeMismatch) {
                            emailInput.setCustomValidity('Por favor, ingresa un correo electrónico válido que contenga @.');
                        } else {
                            emailInput.setCustomValidity('');
                        }
                    });
                    break;
                    
                default:
                    fieldContainer.innerHTML = `
                        <label for="field-${campo.id}">${campo.nombre_campo}${campo.requerido ? '<span class="required">*</span>' : ''}</label>
                        <input type="text" id="field-${campo.id}" name="field_${campo.id}" ${campo.requerido ? 'required' : ''}>
                    `;
            }
            
            form.appendChild(fieldContainer);
        });
        
        // Agregar botón de enviar
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'submit-button';
        submitBtn.innerHTML = `
            <span class="button-icon">📨</span>
            <span class="button-text">Enviar Ticket</span>
        `;
        form.appendChild(submitBtn);
        
        // Limpiar el contenedor y agregar el formulario
        formularioContainer.innerHTML = '';
        formularioContainer.appendChild(form);
        
        // Manejar envío del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (!userData) throw new Error("No hay datos de usuario");

                // Configurar botón durante envío
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="spinner"></span>
                    <span class="button-text">Enviando...</span>
                `;

                const formData = new FormData();
                const camposValues = {};

                // Procesar campos normales
                campos.forEach(campo => {
                    if (campo.tipo_campo !== 'archivo') {
                        const input = form.querySelector(`[name="field_${campo.id}"]`);
                        if (input) {
                            let value = input.type === 'checkbox' ? input.checked : input.value;
                            if (value !== '' && value !== null && value !== undefined) {
                                camposValues[`field_${campo.id}`] = value;
                            }
                        }
                    }
                });

                // Procesar archivos
                const fileInput = form.querySelector('input[type="file"]');
                if (fileInput?.files?.length > 0) {
                    for (const file of fileInput.files) {
                        formData.append('archivo', file);
                    }
                }

                // Agregar datos del ticket
                formData.append('ticket', JSON.stringify({
                    id_categoria: parseInt(idCategoria),
                    id_usuario: userData.id,
                    id_estado: 2,
                    asunto: document.getElementById('asunto').value,
                    descripcion: document.getElementById('descripcion').value,
                    campos: camposValues
                }));

                // Enviar al backend
                const response = await fetch(`${BASE_URL}/api/tickets`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error del servidor');
                }

                const responseData = await response.json();
                alert(`Ticket #${responseData.ticketId} enviado correctamente`);

                // Limpiar formulario (sin cerrar el modal)
                form.reset();
                if (fileInput) fileInput.value = ''; // Limpiar input de archivo
                document.getElementById('asunto').value = '';
                document.getElementById('descripcion').value = '';

            } catch (error) {
                console.error('Error al enviar el ticket:', error);
                alert(`Error: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <span class="button-icon">📨</span>
                    <span class="button-text">Enviar Ticket</span>
                `;
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        formTitle.textContent = 'FORMULARIO DE TICKET';
        formularioContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

document.getElementById('cerrarModal').addEventListener('click', function() {
    document.getElementById('modalFormulario').style.display = 'none';
});


// Iniciar al cargar DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrearSolicitud);
} else {
    initCrearSolicitud();
}