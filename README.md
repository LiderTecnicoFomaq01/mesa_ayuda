# Módulo de Mesa de Ayuda – FOMAG

## Introducción
El Módulo de Mesa de Ayuda de FOMAG está diseñado para centralizar y optimizar la gestión de requerimientos, consultas y necesidades tecnológicas tanto de usuarios internos como externos. A través de este sistema, se busca agilizar los procesos de reporte de incidentes, solicitudes de soporte y asesoría en temas de TI, garantizando una atención estructurada y eficiente.

- **Usuarios internos**: Afiliados a FOMAG que podrán reportar incidentes, solicitar soporte y recibir asesoría en todos los aspectos relacionados con tecnología de la información.
- **Usuarios externos**: Prestadores de servicios de salud (IPS y aliados estratégicos) que requieren soporte técnico y acompañamiento para asegurar la continuidad operativa de sus servicios.

Este proyecto responde a la necesidad de contar con un flujo de trabajo claro para la atención de solicitudes, asegurando trazabilidad, transparencia y mejora continua.

## Alcance
El sistema incluye las siguientes funcionalidades principales:

1. **Registro de solicitudes**  
   - Creación de tickets para incidentes, consultas y requerimientos de soporte.
   - Captura de datos clave: tipo de solicitud, prioridad, descripción y usuario solicitante.

2. **Clasificación y priorización**  
   - Categorización automática o manual de cada ticket según su naturaleza (incidente, consulta, cambio, etc.).  
   - Asignación de nivel de prioridad basado en impacto y urgencia.

3. **Flujo de atención definido**  
   - Asignación de tickets al personal de soporte correspondiente.  
   - Estados de seguimiento: Abierto → En progreso → Resuelto → Cerrado.  
   - Notificaciones automáticas a usuarios y técnicos en cada cambio de estado.

4. **Comunicación y seguimiento**  
   - Canal de comunicación interno entre solicitante y equipo de soporte (mensajes y adjuntos).  
   - Historial completo de cada ticket para consultas posteriores.

5. **Reportes e indicadores**  
   - Generación de informes sobre volumen de tickets, tiempos de respuesta y resolución.  
   - Métricas de satisfacción de usuarios (encuestas post-cierre).  
   - Dashboard de KPIs para la toma de decisiones y mejora continua.

Con estas capacidades, el Módulo de Mesa de Ayuda contribuirá a la optimización de la gestión de TI en FOMAG, mejorando la eficiencia operativa y la calidad del servicio brindado a todos los usuarios.  

---

## Anexo Técnico

### Backend

El backend del módulo ha sido desarrollado con **Node.js**, utilizando una estructura en capas para una mejor organización del código:

- `controllers/`: Maneja las solicitudes y respuestas HTTP.
- `services/`: Contiene la lógica de negocio y la interacción con la base de datos.
- `routes/`: Define los endpoints disponibles de la API.
- `server.js`: Archivo principal para levantar el servidor Express.
- `multer`: Librería utilizada para la carga de archivos adjuntos en los tickets.

### Frontend

El frontend fue creado con tecnologías web puras:

- **HTML** para la estructura.
- **CSS** para los estilos.
- **JavaScript** para la lógica del cliente y la interacción con la API.

No se emplearon frameworks para mantener la solución ligera y fácil de implementar.

### Base de Datos

La base de datos utiliza **MySQL**. El script de creación se encuentra en: mesa-ayuda/create_database.sql


Este script debe ejecutarse antes de iniciar el sistema para crear las tablas necesarias.

Los usuarios de ejemplo definidos en `datos_iniciales.sql` se crean con contraseñas cifradas.
Al iniciar sesión por primera vez se solicitará al usuario que actualice su contraseña para activar la cuenta.

### Levantamiento del Servidor

Para levantar el backend localmente:

1. Clona el repositorio:
   git clone https://github.com/3vanII/mesa_ayuda.git
2. Navega a la carpeta del backend:
   cd mesa-ayuda/backend
3. Instala las dependencias (si es necesario):
   npm install express mysql2 multer cors dotenv jsonwebtoken bcrypt
5. Inicia el servidor:
   node server.js



