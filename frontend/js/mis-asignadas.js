// Comprobar si ya están definidas las constantes
if (typeof API_URL === 'undefined') {
    var API_URL = 'http://localhost:4000/api/filtros'; // Usamos 'var' para que sea accesible globalmente
}


var TICKETS_URL = 'http://localhost:4000/api/asignadas/MisAsignadasTickets';


function initMisAsignadas() {
    console.log("Panel Mis Asignadas cargado");

    // Verificar si el usuario está autenticado
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
        console.warn("No hay datos de usuario, redirigiendo a login");
        window.location.href = "login.html"; // Redirigir al login si no hay datos
        return;
    }

    const userId = userData.id;
    sessionStorage.setItem('userId', userId); // 🔧 Guardar el ID en sessionStorage

    // Cargar filtros, tickets y eventos
    cargarFiltros();
    cargarTickets(userId);
    configurarEventosFiltros();
}

function configurarEventosFiltros() {
    const selectArea = document.getElementById('filtro-area');
    const selectCategoria = document.getElementById('filtro-categoria');
    const selectEstado = document.getElementById('filtro-estado');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    const btnAplicar = document.getElementById('btn-aplicar-filtros');

    // Evento para cargar categorías al cambiar área
    if (selectArea) {
        selectArea.addEventListener('change', (event) => {
            const idAreaSeleccionada = event.target.value;
            cargarCategorias(idAreaSeleccionada);
        });
    }

    // Evento para aplicar filtros
    if (btnAplicar) {
        btnAplicar.addEventListener('click', aplicarFiltros);
    }

    // Evento para limpiar filtros
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            // Limpiar los valores de los combobox
            selectArea.value = '';
            selectCategoria.value = '';
            selectEstado.value = '';

            // Limpiar el textbox de radicado
            const inputRadicado = document.getElementById('filtro-radicado');
            if (inputRadicado) {
                inputRadicado.value = ''; // Limpiar el valor del textbox
            }

            // Recargar categorías
            cargarCategorias();

            // Volver a cargar los tickets sin filtros
            const userId = sessionStorage.getItem('userId'); // Corrección aquí
            if (userId) {
                cargarTickets(userId); // Llamar a la función para cargar todos los tickets
            }
        });
    }
}

// Función para aplicar filtros y recargar tickets
function aplicarFiltros() {
    const selectArea = document.getElementById('filtro-area');
    const selectCategoria = document.getElementById('filtro-categoria');
    const selectEstado = document.getElementById('filtro-estado');
    const inputRadicado = document.getElementById('filtro-radicado'); // Obtener el input del radicado

    const areaText = selectArea?.options[selectArea.selectedIndex]?.text || '';
    const categoriaText = selectCategoria?.options[selectCategoria.selectedIndex]?.text || '';
    const estadoText = selectEstado?.options[selectEstado.selectedIndex]?.text || '';
    const radicado = inputRadicado?.value.trim() || ''; // Obtener el valor del input radicado

    const filters = {};

    // Filtrar por área si el valor no es "Seleccione un área"
    if (areaText !== 'Seleccione un área') {
        filters.area = areaText.trim();
    }

    // Filtrar por categoría si el valor no es "Seleccione una categoría"
    if (categoriaText !== 'Seleccione una categoría') {
        filters.categoria = categoriaText.trim();
    }

    // Filtrar por estado si el valor no es "Seleccione un estado"
    if (estadoText !== 'Seleccione un estado') {
        filters.estado = estadoText.trim();
    }

    // Filtrar por radicado si se ha proporcionado un valor
    if (radicado !== '') {
        filters.radicado = radicado;
    }

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.warn('No se encontró el userId en sessionStorage');
        return;
    }

    console.log('Aplicando filtros válidos:', filters);
    cargarTickets(userId, filters);
}

// Calcular color de semáforo basado en tiempos traídos del backend
function obtenerIndicativoSemaforo(fechaCreacion, tiempoVerde, tiempoAmarillo, estado, fechaCierre = null) {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);

    let fin = ahora;

    // ✅ SOLO si está "resuelto", detenemos el contador (usamos fechaCierre si está disponible)
    if (estado && estado.toLowerCase() === 'resuelto' && fechaCierre) {
        fin = new Date(fechaCierre);
    } else if (estado && estado.toLowerCase() === 'resuelto' && !fechaCierre) {
        fin = ahora;  // Si no tienes fecha_cierre, congelamos en el tiempo actual (no sigue creciendo)
    }

    const horasTranscurridas = Math.floor((fin - creacion) / (1000 * 60 * 60));

    let tiempoTexto = `${horasTranscurridas} h`;
    if (horasTranscurridas >= 48) {
        const dias = Math.floor(horasTranscurridas / 24);
        tiempoTexto = `${dias} d`;
    }

    let color = '#cccccc'; // neutro por defecto

    if (tiempoVerde == null || tiempoAmarillo == null) {
        color = '#cccccc'; // neutro si no hay data
    } else if (horasTranscurridas < tiempoVerde) {
        color = 'green';
    } else if (horasTranscurridas < tiempoAmarillo) {
        color = 'orange';
    } else {
        color = 'red';
    }

    return { tiempoTexto, color };
}


function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // meses van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function obtenerEstiloPrioridad(prioridad) {
    if (!prioridad) return '';

    switch (prioridad.toLowerCase()) {
        case 'alta':
            return 'background-color: red; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
        case 'media':
            return 'background-color: orange; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
        case 'baja':
            return 'background-color: goldenrod; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
        default:
            return 'color: black;';
    }
}

function obtenerEstiloEstado(estado) {
    if (!estado) return '';

    switch (estado.toLowerCase()) {
        case 'cancelado':
            return 'background-color: red; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
        case 'resuelto':
            return 'background-color: #4caf50; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
        case 'finalizado':
            return 'background-color: #2e7d32; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
        default:
            return 'background-color: #2196f3; color: white; font-weight: bold; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;';
    }
}

// Función principal para cargar tickets con o sin filtros
async function cargarTickets(userId, filters = {}) {
    const tbody = document.getElementById('ticket-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6">Cargando tickets...</td></tr>';

    try {
        const response = await fetch(`${TICKETS_URL}/${userId}`);
        if (!response.ok) throw new Error('Error al cargar tickets');

        const todosLosTickets = await response.json();

        const ticketsFiltrados = todosLosTickets.filter(ticket => {
            // Filtro por radicado
            if (filters.radicado && filters.radicado !== '' && ticket.radicado.toString() !== filters.radicado) {
                return false;
            }

            // Filtro por área
            if (filters.area && filters.area !== '' && ticket.area.toLowerCase() !== filters.area.toLowerCase()) {
                return false;
            }

            // Filtro por categoría
            if (filters.categoria && filters.categoria !== '' && ticket.categoria.toLowerCase() !== filters.categoria.toLowerCase()) {
                return false;
            }

            // Filtro por estado
            if (filters.estado && filters.estado !== '' && ticket.estado.toLowerCase() !== filters.estado.toLowerCase()) {
                return false;
            }

            return true;
        });

        tbody.innerHTML = '';

        if (ticketsFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No se encontraron tickets con los filtros aplicados</td></tr>';
            return;
        }

        ticketsFiltrados.forEach(ticket => {
            const { tiempoTexto, color } = obtenerIndicativoSemaforo(ticket.fecha_creacion, ticket.tiempo_verde, ticket.tiempo_amarillo);
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${ticket.radicado}</td>
                <td>${ticket.area}</td>
                <td>${ticket.categoria}</td>
                <td>${ticket.asunto}</td>
                <td><span style="${obtenerEstiloEstado(ticket.estado)} white-space: nowrap;">${(ticket.estado || 'SIN ESTADO').toUpperCase()}</span></td>
                <td>${formatearFecha(ticket.fecha_creacion)}</td>
                <td><span style="${obtenerEstiloPrioridad(ticket.prioridad)}">${(ticket.prioridad || 'No definida').toUpperCase()}</span></td>
                <td>
                    <span style="
                        display: inline-block;
                        padding: 5px 10px;
                        border-radius: 5px;
                        background-color: ${color};
                        color: white;
                        font-weight: bold;
                    ">
                        ${tiempoTexto}
                    </span>
                </td>
            `;

            // Asignar un evento click a la fila para abrir la nueva pestaña
            row.addEventListener('click', () => {
                // Reemplaza '/detalles_ticket/${ticket.radicado}' con la URL correspondiente
                window.open(`/frontend/views/detalle-ticket.html?radicado=${ticket.radicado}`, '_blank');

            });

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando tickets:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error al cargar tickets</td></tr>';
    }
}

// Cargar filtros disponibles (áreas, categorías, estados)
async function cargarFiltros() {
    await cargarAreas();
    await cargarEstados();
    await cargarCategorias();
}

async function cargarAreas() {
    const selectArea = document.getElementById('filtro-area');
    if (!selectArea) return;

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
    }
}

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

async function cargarCategorias(idArea = '') {
    const selectCategoria = document.getElementById('filtro-categoria');
    if (!selectCategoria) return;

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
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMisAsignadas);
} else {
    initMisAsignadas();
}
