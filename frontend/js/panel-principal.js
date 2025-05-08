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

    // Mostrar panel
    panelElement.style.display = "block";
    if (welcomePanel) welcomePanel.style.display = "none";

    // Cargar contenido solo si no está ya cargado
    if (!panelElement.dataset.loaded) {
        try {
            await loadPanelContent(panelId);
            panelElement.dataset.loaded = "true";
        } catch (error) {
            console.error(`Error al cargar panel ${panelId}:`, error);
            panelElement.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar el panel <strong>${panelId}</strong>.</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

async function loadPanelContent(panelId) {
    console.log(`Cargando contenido para ${panelId}`);
    
    const panelElement = document.getElementById(panelId);
    if (!panelElement) throw new Error(`Panel ${panelId} no encontrado`);

    // CORRECCIÓN EN LA RUTA - ajusta según tu estructura real
    const viewPath = `../views/${panelId}.html`;  // Cambiado a ../views/
    
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
        
        // CORRECCIÓN EN LAS RUTAS - ajusta según tu estructura
        const basePath = '../';  // Usa ../ para subir un nivel
        
        // Cargar CSS
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = `${basePath}css/${panelId}.css`;
        cssLink.onload = () => {
            console.log(`CSS para ${panelId} cargado`);
            // No resolvemos aquí porque aún falta cargar el JS
        };
        cssLink.onerror = () => {
            console.warn(`No se pudo cargar CSS para ${panelId}`);
            // No rechazamos porque el CSS es opcional
        };
        document.head.appendChild(cssLink);

        // Cargar JS
        const script = document.createElement("script");
        script.src = `${basePath}js/${panelId}.js`;
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