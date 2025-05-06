const API_URL = 'http://localhost:4000/api/filtros';

function initMisSolicitudes() {
    console.log("Panel Mis Solicitudes cargado");
    cargarFiltros();

    // 🔁 Aseguramos que el listener se active una sola vez cuando el DOM ya está cargado
    const selectArea = document.getElementById('filtro-area');
    if (selectArea) {
        selectArea.addEventListener('change', (event) => {
            const idAreaSeleccionada = event.target.value;
            console.log("Área seleccionada:", idAreaSeleccionada);
            cargarCategorias(idAreaSeleccionada); // Filtrar por área
        });
    }

    document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
        document.getElementById('filtro-area').value = '';
        document.getElementById('filtro-estado').value = '';
        document.getElementById('filtro-categoria').value = '';
        cargarCategorias(); // Volver a cargar todas las categorías
    });
}

function cargarFiltros() {
    console.log('Iniciando carga de filtros...');
    cargarAreas();
    cargarEstados();
    cargarCategorias(); // todas al inicio
}

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

async function cargarCategorias(idArea = '') {
    const selectCategoria = document.getElementById('filtro-categoria');
    try {
        console.log("Cargando categorías...");
        let url = `${API_URL}/categorias`;

        if (idArea) {
            url += `?area_id=${idArea}`;
            console.log("URL con filtro de área:", url); // Verifica cómo se construye la URL
        } else {
            console.log("URL sin filtro de área:", url); // Si no hay área seleccionada
        }

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
