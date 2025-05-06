const API_URL = 'http://localhost:4000/api/filtros';
const TICKETS_URL = 'http://localhost:4000/api/misSolicitudesTickets';

function initMisSolicitudes() {
    console.log("Panel Mis Solicitudes cargado");

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
            selectArea.value = '';
            selectCategoria.value = '';
            selectEstado.value = '';
            cargarCategorias();

            const userId = sessionStorage.getItem('userId'); // Corrección aquí
            if (userId) {
                cargarTickets(userId);
            }
        });
    }
}

// Función para aplicar filtros y recargar tickets
function aplicarFiltros() {
    const selectArea = document.getElementById('filtro-area');
    const selectCategoria = document.getElementById('filtro-categoria');
    const selectEstado = document.getElementById('filtro-estado');

    const areaText = selectArea?.options[selectArea.selectedIndex]?.text || '';
    const categoriaText = selectCategoria?.options[selectCategoria.selectedIndex]?.text || '';
    const estadoText = selectEstado?.options[selectEstado.selectedIndex]?.text || '';

    const filters = {};

    if (areaText !== 'Seleccione un área') {
        filters.area = areaText.trim();
    }

    if (categoriaText !== 'Seleccione una categoría') {
        filters.categoria = categoriaText.trim();
    }

    if (estadoText !== 'Seleccione un estado') {
        filters.estado = estadoText.trim();
    }

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.warn('No se encontró el userId en sessionStorage');
        return;
    }

    console.log('Aplicando filtros válidos:', filters);
    cargarTickets(userId, filters);
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
            if (filters.area && filters.area !== '' &&
                ticket.area.toLowerCase() !== filters.area.toLowerCase()) return false;

            if (filters.categoria && filters.categoria !== '' &&
                ticket.categoria.toLowerCase() !== filters.categoria.toLowerCase()) return false;

            if (filters.estado && filters.estado !== '' &&
                ticket.estado.toLowerCase() !== filters.estado.toLowerCase()) return false;

            return true;
        });

        tbody.innerHTML = '';

        if (ticketsFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No se encontraron tickets con los filtros aplicados</td></tr>';
            return;
        }

        ticketsFiltrados.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.radicado}</td>
                <td>${ticket.area}</td>
                <td>${ticket.categoria}</td>
                <td>${ticket.estado}</td>
                <td>${new Date(ticket.fecha_creacion).toLocaleDateString()}</td>
                <td>${ticket.prioridad || 'No definida'}</td>
            `;
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
    document.addEventListener('DOMContentLoaded', initMisSolicitudes);
} else {
    initMisSolicitudes();
}
