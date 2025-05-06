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
    
    const userId = userData.id;  // Asumiendo que el userData tiene una propiedad 'id'

    // Cargar ambos componentes
    cargarFiltros();
    cargarTickets(userId);

    // Configurar eventos de filtros
    configurarEventosFiltros();
}

function configurarEventosFiltros() {
    const selectArea = document.getElementById('filtro-area');
    const selectCategoria = document.getElementById('filtro-categoria');
    const selectEstado = document.getElementById('filtro-estado');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    const btnAplicar = document.getElementById('btn-aplicar-filtros'); // Asegúrate de que el ID coincida con tu HTML

    // Evento para área (solo carga categorías, no aplica filtros)
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
            document.getElementById('filtro-area').value = '';
            document.getElementById('filtro-estado').value = '';
            document.getElementById('filtro-categoria').value = '';
            cargarCategorias();
            cargarTickets(); // Vuelve a cargar todos los tickets sin filtros
        });
    }
}

// Función para cargar tickets con filtros
async function cargarTickets(userId, filters = {}) {
    const tbody = document.getElementById('ticket-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5">Cargando tickets...</td></tr>';

    try {
        // Construir URL con parámetros de filtro
        let url = `${TICKETS_URL}/${userId}`;
        const params = new URLSearchParams();
        
        if (filters.area) params.append('area', filters.area);
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.estado) params.append('estado', filters.estado);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar tickets');
        
        const data = await response.json();
        
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No se encontraron tickets</td></tr>';
            return;
        }

        data.forEach(ticket => { 
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
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar tickets</td></tr>';
    }
}

// Función para aplicar filtros
function aplicarFiltros() {
    const filters = {
        area: document.getElementById('filtro-area')?.value || '',
        categoria: document.getElementById('filtro-categoria')?.value || '',
        estado: document.getElementById('filtro-estado')?.value || ''
    };
    
    console.log("Aplicando filtros:", filters);
    cargarTickets(1, filters);
}

// Funciones para cargar combobox (se mantienen igual)
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

// Inicialización segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMisSolicitudes);
} else {
    initMisSolicitudes();
}