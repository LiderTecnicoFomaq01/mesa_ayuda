document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idCategoria = urlParams.get('id');
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
        const response = await fetch(`http://localhost:4000/api/areas/${idCategoria}/campos`);
        
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
        form.enctype = 'multipart/form-data'; // Importante para formularios con archivos
        
        campos.forEach(campo => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'form-field';
            
            let input;
            
            switch(campo.tipo_campo) {
                case 'texto':
                    // Crear label
                    const labelTexto = document.createElement('label');
                    labelTexto.htmlFor = `field-${campo.id}`;
                    labelTexto.textContent = campo.nombre_campo;
                    
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        labelTexto.appendChild(requiredSpan);
                    }
                    
                    // Crear input
                    input = document.createElement('input');
                    input.type = 'text';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;
                    input.required = campo.requerido;
                    input.placeholder = 'Ingrese ' + campo.nombre_campo.toLowerCase();
                    
                    fieldContainer.appendChild(labelTexto);
                    fieldContainer.appendChild(input);
                    break;
                    
                case 'numero':
                    // Crear label
                    const labelNumero = document.createElement('label');
                    labelNumero.htmlFor = `field-${campo.id}`;
                    labelNumero.textContent = campo.nombre_campo;
                    
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        labelNumero.appendChild(requiredSpan);
                    }
                    
                    // Crear input
                    input = document.createElement('input');
                    input.type = 'number';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;
                    input.required = campo.requerido;
                    input.placeholder = 'Ingrese ' + campo.nombre_campo.toLowerCase();
                    
                    fieldContainer.appendChild(labelNumero);
                    fieldContainer.appendChild(input);
                    break;
                    
                case 'fecha':
                    // Crear label
                    const labelFecha = document.createElement('label');
                    labelFecha.htmlFor = `field-${campo.id}`;
                    labelFecha.textContent = campo.nombre_campo;
                    
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        labelFecha.appendChild(requiredSpan);
                    }
                    
                    // Crear input
                    input = document.createElement('input');
                    input.type = 'date';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;
                    input.required = campo.requerido;
                    
                    fieldContainer.appendChild(labelFecha);
                    fieldContainer.appendChild(input);
                    break;
                    
                case 'booleano':
                    // Contenedor principal para el checkbox
                    const checkboxGroup = document.createElement('div');
                    checkboxGroup.className = 'checkbox-group';
                    
                    // Pregunta/etiqueta principal (encima del checkbox)
                    const pregunta = document.createElement('p');
                    pregunta.className = 'checkbox-question';
                    pregunta.textContent = campo.nombre_campo;
                    
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        pregunta.appendChild(requiredSpan);
                    }
                    
                    // Contenedor para el checkbox y su etiqueta
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.className = 'checkbox-container';
                    
                    // Crear checkbox
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;
                    input.required = campo.requerido;
                    
                    // Etiqueta pequeña para el checkbox
                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.htmlFor = `field-${campo.id}`;
                    checkboxLabel.textContent = 'Marcar si aplica';
                    checkboxLabel.className = 'checkbox-label';
                    
                    checkboxContainer.appendChild(input);
                    checkboxContainer.appendChild(checkboxLabel);
                    
                    checkboxGroup.appendChild(pregunta);
                    checkboxGroup.appendChild(checkboxContainer);
                    
                    fieldContainer.appendChild(checkboxGroup);
                    break;
                
                case 'textarea':
                    // Contenedor principal para el textarea
                    const textareaGroup = document.createElement('div');
                    textareaGroup.className = 'textarea-group';
                
                    // Etiqueta/pregunta para el textarea
                    const preguntaTextarea = document.createElement('label');
                    preguntaTextarea.className = 'textarea-label';
                    preguntaTextarea.htmlFor = `field-${campo.id}`;
                    preguntaTextarea.textContent = campo.nombre_campo;
                
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = ' *';
                        preguntaTextarea.appendChild(requiredSpan);
                    }
                
                    // Crear el textarea
                    const textarea = document.createElement('textarea');
                    textarea.id = `field-${campo.id}`;
                    textarea.name = `field_${campo.id}`;
                    textarea.required = campo.requerido;
                    textarea.rows = 4; // Puedes ajustar el número de filas
                    textarea.className = 'textarea-input';
                
                    // Opcional: Placeholder
                    textarea.placeholder = 'Escribe aquí...';
                
                    // Agregar la etiqueta y el textarea al contenedor
                    textareaGroup.appendChild(preguntaTextarea);
                    textareaGroup.appendChild(textarea);
                
                    // Agregar al contenedor general
                    fieldContainer.appendChild(textareaGroup);
                    break;
                    
                case 'archivo':
                    const labelArchivo = document.createElement('label');
                    labelArchivo.htmlFor = `field-${campo.id}`;
                    labelArchivo.textContent = campo.nombre_campo;
                
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        labelArchivo.appendChild(requiredSpan);
                    }
                
                    const fileContainer = document.createElement('div');
                    fileContainer.className = 'file-input-container';
                
                    const fileButton = document.createElement('span');
                    fileButton.className = 'file-input-button';
                    fileButton.textContent = 'Seleccionar archivo';
                
                    const fileName = document.createElement('span');
                    fileName.className = 'file-input-name';
                    fileName.textContent = 'Ningún archivo seleccionado';
                
                    input = document.createElement('input');
                    input.type = 'file';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;  // <- nombre dinámico
                    input.required = campo.requerido;
                    input.multiple = true;             // <- permitir múltiples archivos
                
                    input.addEventListener('change', (e) => {
                        const names = Array.from(e.target.files).map(f => f.name).join(', ');
                        fileName.textContent = names || 'Ningún archivo seleccionado';
                    });
                
                    fileContainer.appendChild(fileButton);
                    fileContainer.appendChild(fileName);
                    fileContainer.appendChild(input);
                
                    fieldContainer.appendChild(labelArchivo);
                    fieldContainer.appendChild(fileContainer);
                    break;
                
                case 'email':
                    // Contenedor principal para el campo de email
                    const emailGroup = document.createElement('div');
                    emailGroup.className = 'email-group';
                    
                    // Etiqueta/pregunta
                    const emailLabel = document.createElement('label');
                    emailLabel.htmlFor = `field-${campo.id}`;
                    emailLabel.className = 'email-label';
                    emailLabel.textContent = campo.nombre_campo;
                    
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        emailLabel.appendChild(requiredSpan);
                    }
                
                    // Crear input de tipo email
                    input = document.createElement('input');
                    input.type = 'email';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;
                    input.required = campo.requerido;
                    input.className = 'email-input';
                
                    // Mensaje de error personalizado si quieres reforzar el mensaje
                    input.addEventListener('invalid', function (event) {
                        if (input.validity.typeMismatch) {
                            input.setCustomValidity('Por favor, ingresa un correo electrónico válido que contenga @.');
                        } else {
                            input.setCustomValidity('');
                        }
                    });
                
                    emailGroup.appendChild(emailLabel);
                    emailGroup.appendChild(input);
                
                    fieldContainer.appendChild(emailGroup);
                    break;
                    
                default:
                    // Crear label
                    const labelDefault = document.createElement('label');
                    labelDefault.htmlFor = `field-${campo.id}`;
                    labelDefault.textContent = campo.nombre_campo;
                    
                    if (campo.requerido) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required';
                        requiredSpan.textContent = '*';
                        labelDefault.appendChild(requiredSpan);
                    }
                    
                    // Crear input
                    input = document.createElement('input');
                    input.type = 'text';
                    input.id = `field-${campo.id}`;
                    input.name = `field_${campo.id}`;
                    input.required = campo.requerido;
                    
                    fieldContainer.appendChild(labelDefault);
                    fieldContainer.appendChild(input);
            }
            
            form.appendChild(fieldContainer);
        });
        
      // Agregar botón de enviar
const submitBtn = document.createElement('button');
submitBtn.type = 'submit';
submitBtn.className = 'submit-button';
submitBtn.textContent = 'Enviar Ticket';
form.appendChild(submitBtn);

// Limpiar el contenedor y agregar el formulario
formularioContainer.innerHTML = '';
formularioContainer.appendChild(form);

// Manejar envío del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const userData = JSON.parse(localStorage.getItem("userData"));

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner"></span>
            <span class="button-text">Enviando...</span>
        `;

        const formData = new FormData();
        const camposValues = {};
        const fileInfosArray = [];

        campos.forEach(campo => {
            const input = form.querySelector(`[name="field_${campo.id}"]`);

            if (campo.tipo_campo === 'archivo') {
                if (input && input.files.length > 0) {
                    const fileNames = [];

                    for (const file of input.files) {
                        formData.append(campo.id, file); // nombre del campo único
                        fileInfosArray.push({
                            id_campo: campo.id,
                            nombre_original: file.name
                        });
                        fileNames.push(file.name);
                    }

                    camposValues[campo.id];
                }
            } else {
                if (!input) return;

                let value = input.type === 'checkbox' ? input.checked : input.value;

                if (value !== '' && value !== null && value !== undefined) {
                    camposValues[`field_${campo.id}`] = value;
                }
            }
        });

        // Agregar info general
        const asunto = document.getElementById('asunto').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        formData.append('ticket', JSON.stringify({
            id_categoria: parseInt(idCategoria),
            id_usuario: userData.id,
            id_estado: 2,
            asunto,
            descripcion,
            campos: camposValues
        }));

        // Agregar metadata de archivos
        formData.append('fileInfos', JSON.stringify(fileInfosArray));

        // Enviar
        const response = await fetch('http://localhost:4000/api/tickets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userData.token}`
            },
            body: formData
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Error del servidor');
        }

        const delay = responseData.fileName ? 7000 : 3000;
        setTimeout(() => successMessage.remove(), delay);
        setTimeout(() => form.reset(), delay);

    } catch (error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Error: ${error.message}`;
        form.prepend(errorMessage);
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
        formTitle.textContent = 'FORMULARIO DE TICKET'; // Asegurar título por defecto
        formularioContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
});