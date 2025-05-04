console.log('Script crear-solicitud.js iniciado');

// Función principal
async function initCrearSolicitud() {
    console.log('Inicializando módulo de creación de solicitud');
    
    try {
        const contenedor = document.getElementById('contenedor-areas');
        if (!contenedor) throw new Error('Contenedor de áreas no encontrado');

        contenedor.innerHTML = '<div class="cargando">Cargando áreas disponibles...</div>';

        console.log('Solicitando áreas al API...');
        const response = await fetch('http://localhost:4000/api/areas', {
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
        boton.textContent = area.nombre;
        boton.dataset.areaId = area.id;

        const contenedorCategorias = document.createElement('div');
        contenedorCategorias.className = 'categorias-contenedor';
        contenedorCategorias.id = `categorias-${area.id}`;

        boton.addEventListener('click', async (event) => {
            seleccionarArea(area, event.currentTarget);
            await cargarCategorias(area.id, contenedorCategorias);
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

// Carga las categorías del área y las muestra en su contenedor
async function cargarCategorias(idArea, contenedor) {
    // Oculta todos los demás contenedores de categorías
    document.querySelectorAll('.categorias-contenedor').forEach(c => {
        c.innerHTML = '';
    });

    contenedor.innerHTML = '<div class="cargando">Cargando categorías...</div>';

    try {
        const response = await fetch(`http://localhost:4000/api/areas/${idArea}/categorias`);

        if (!response.ok) throw new Error('Error al obtener categorías');

        const categorias = await response.json();

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
            boton.addEventListener('click', () => {
                localStorage.setItem('categoriaSeleccionada', JSON.stringify(cat));
                window.open(`/ruta-a-nueva-pagina.html?idCategoria=${cat.id}`, '_blank');
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

// Iniciar al cargar DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrearSolicitud);
} else {
    initCrearSolicitud();
}
