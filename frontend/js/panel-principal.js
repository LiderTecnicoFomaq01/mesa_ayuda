document.addEventListener("DOMContentLoaded", async () => {
    console.log("Inicializando aplicación...");

    // Verificar autenticación
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
        console.warn("No hay datos de usuario, redirigiendo a login");
        window.location.href = "login.html";
        return;
    }

    // Configurar interfaz de usuario
    setupUserInterface(userData);

    // Preparar menú de usuario
    setupUserDropdown();

    // Configurar navegación
    await setupModuleNavigation();
});

function setupUserInterface(userData) {
    // Configurar rol de admin
    if (userData.rol === "admin" || userData.rol === "usuario administrativo") {
        document.body.classList.add("admin");
    }

    // Mostrar nombre de usuario
    const nombreElemento = document.getElementById("usuarioNombre");
    if (nombreElemento) {
        nombreElemento.textContent = formatUserName(userData);
    }
}

function formatUserName(userData) {
    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, nombre } = userData;
    if (primer_nombre && primer_apellido) {
        return [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido]
            .filter(Boolean)
            .join(" ")
            .toUpperCase();
    }
    return nombre ? nombre.toUpperCase() : "USUARIO";
}

async function setupModuleNavigation() {
    console.log("Configurando navegación entre módulos");

    const modulos = document.querySelectorAll(".modulo");
    const panelBienvenida = document.querySelector(".panel-bienvenida");

    // Cargar el primer módulo visible por defecto
    const moduloInicial = document.querySelector(".modulo.active") || modulos[0];
    if (moduloInicial) {
        await loadModule(moduloInicial.getAttribute("data-panel"), panelBienvenida);
    }

    // Configurar event listeners
    modulos.forEach(modulo => {
        modulo.addEventListener("click", async () => {
            if (modulo.classList.contains("active")) {
                console.log(`Módulo ${modulo.getAttribute("data-panel")} ya está activo`);
                return;
            }
            await handleModuleClick(modulo, modulos, panelBienvenida);
        });
    });
}

async function handleModuleClick(clickedModule, allModules, welcomePanel) {
    console.log(`Módulo clickeado: ${clickedModule.getAttribute("data-panel")}`);

    // Actualizar estado activo
    allModules.forEach(m => m.classList.remove("active"));
    clickedModule.classList.add("active");

    // Ocultar todos los paneles
    document.querySelectorAll(".panel-contenido").forEach(panel => {
        panel.style.display = "none";
    });

    // Cargar y mostrar el panel seleccionado
    const panelId = clickedModule.getAttribute("data-panel");
    await loadModule(panelId, welcomePanel);
}

async function loadModule(panelId, welcomePanel) {
    console.log(`Cargando panel: ${panelId}`);

    const panelElement = document.getElementById(panelId);
    if (!panelElement) {
        console.warn(`Panel ${panelId} no encontrado`);
        if (welcomePanel) welcomePanel.style.display = "block";
        return;
    }

    // Ocultar y limpiar TODOS los paneles
    const allPanels = document.querySelectorAll(".panel-contenido");
    allPanels.forEach(panel => {
        panel.style.display = "none";
        panel.innerHTML = "";
    });

    // Mostrar el panel nuevo
    panelElement.style.display = "block";
    if (welcomePanel) welcomePanel.style.display = "none";

    try {
        await loadPanelContent(panelId); // Siempre recargar (sin cache por ahora)
    } catch (error) {
        console.error(`Error al cargar panel ${panelId}:`, error);
        panelElement.innerHTML = `
            <div class="error-message" style="padding:20px; color: #fff; background-color: #e74c3c; border-radius: 8px;">
                <p>Error al cargar el panel <strong>${panelId}</strong>.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function loadPanelContent(panelId) {
    console.log(`Cargando contenido para ${panelId}`);

    const panelElement = document.getElementById(panelId);
    if (!panelElement) throw new Error(`Panel ${panelId} no encontrado`);

    const viewPath = `../views/${panelId}.html`;

    console.log(`Intentando cargar vista desde: ${viewPath}`);
    const response = await fetch(viewPath);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    panelElement.innerHTML = await response.text();

    // Cargar assets
    await loadPanelAssets(panelId);
}

function loadPanelAssets(panelId) {
    return new Promise((resolve, reject) => {
        console.log(`Cargando assets para ${panelId}`);

        const basePath = '../';

        // Cargar CSS si no está ya cargado
        const cssId = `css-${panelId}`;
        if (!document.getElementById(cssId)) {
            const cssLink = document.createElement("link");
            cssLink.id = cssId;
            cssLink.rel = "stylesheet";
            cssLink.href = `${basePath}css/${panelId}.css`;
            cssLink.onload = () => console.log(`CSS para ${panelId} cargado`);
            cssLink.onerror = () => console.warn(`No se pudo cargar CSS para ${panelId}`);
            document.head.appendChild(cssLink);
        } else {
            console.log(`CSS para ${panelId} ya estaba cargado`);
        }

        // Eliminar TODOS los scripts de paneles antes de cargar el nuevo
        document.querySelectorAll("script[data-panel]").forEach(script => {
            console.log(`Eliminando script de ${script.dataset.panel}`);
            script.remove();
        });

        // Cargar JS
        const script = document.createElement("script");
        script.src = `${basePath}js/${panelId}.js`;
        script.dataset.panel = panelId; // Para identificarlo luego
        script.onload = () => {
            console.log(`Script para ${panelId} cargado correctamente`);
            resolve();
        };
        script.onerror = () => {
            console.error(`Error cargando script para ${panelId}`);
            reject(new Error(`Error cargando script para ${panelId}`));
        };
        document.body.appendChild(script);
    });
}

function setupUserDropdown() {
    const nameElement = document.getElementById('usuarioNombre');
    const dropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!nameElement || !dropdown || !logoutBtn) return;

    nameElement.addEventListener('click', (e) => {
        dropdown.classList.toggle('show');
        e.stopPropagation();
    });

    logoutBtn.addEventListener('click', logout);

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== nameElement) {
            dropdown.classList.remove('show');
        }
    });
}

function logout() {
    const token = localStorage.getItem('authToken');
    if (token) {
        fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => console.error('Error al cerrar sesión:', err));
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

