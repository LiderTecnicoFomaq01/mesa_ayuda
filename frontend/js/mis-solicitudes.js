function initMisSolicitudes() {
    console.log("Panel Mis Solicitudes cargado");
    cargarFiltros();
}

function cargarFiltros() {
    console.log('Iniciando carga de filtros...');
    cargarAreas();
    cargarEstados();
    cargarCategorias();
}

const API_URL = 'http://localhost:4000/api/filtros'; // <== aquí defines tu backend

async function cargarAreas() {
    const selectArea = document.getElementById('filtro-area');
    try {
        console.log("Cargando áreas...");
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
    try {
        console.log("Cargando estados...");
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

async function cargarCategorias() {
    const selectCategoria = document.getElementById('filtro-categoria');
    try {
        console.log("Cargando categorías...");
        const res = await fetch(`${API_URL}/categorias`);
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
