use mesa_ayuda;

INSERT INTO usuarios (
  tipo_documento_id, numero_documento, usuario, primer_nombre, segundo_nombre,
  primer_apellido, segundo_apellido, email, celular, contraseña, rol_id
) VALUES
  (2, '200000002', 'admin2', 'María', 'José', 'Rodríguez', 'López', 'admin2@correo.com', '3000000001', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 1),
  (1, '100000003', 'usuario_admin3', 'Andrés', 'Felipe', 'García', 'Torres', 'usuario_admin3@correo.com', '3000000002', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 2),
  (3, 'CE1234567', 'usuario_admin4', 'Paula', 'Andrea', 'Ramírez', 'Vargas', 'usuario_admin4@correo.com', '3000000003', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 2),
  (4, 'P7654321', 'usuario_admin5', 'Camila', NULL, 'Suárez', 'Mejía', 'usuario_admin5@correo.com', '3000000004', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 2),
  (1, '100000001', 'admin1', 'Carlos', 'Andrés', 'Pérez', 'Gómez', 'admin1@correo.com', '3000000005', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 1),
  (4, 'P1234567', 'usuario_admin1', 'Luisa', NULL, 'Martínez', 'Díaz', 'usuario_admin1@correo.com', '3000000006', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 2),
  (3, 'CE9876543', 'usuario_admin2', 'Juan', 'Esteban', 'Córdoba', NULL, 'usuario_admin2@correo.com', '3000000007', '$2b$10$VktcUyLyfUV8IteoBffHmeO.bOUaD0HM5X.ViS5IQqrJF7zcIAyzC', 2),
  (4, 'P76543216', 'usuario1', 'María', 'Camila', 'Ruiz', 'Sánchez', 'usuario1@correo.com', '3000000008', '$2b$10$qg8YS80GD/imgBbuJfiYOOyVygtc6hYrKRr/aZqZrkL1O7.7b.yzS', 3),
  (1, '100000005', 'usuario2', 'Diego', NULL, 'Fernández', 'López', 'usuario2@correo.com', '3000000009', '$2b$10$qg8YS80GD/imgBbuJfiYOOyVygtc6hYrKRr/aZqZrkL1O7.7b.yzS', 3);

INSERT INTO categorias (id_area, id_prioridad, nombre, descripcion)
VALUES
(1, 1, 'Incidentes de la plataforma', 'Reporte de incidentes críticos que afectan la plataforma en general.'),
(1, 2, 'Creación de usuarios', 'Solicitudes relacionadas con la creación de cuentas de usuario.'),
(1, 2, 'Parametrización de usuarios', 'Ajustes o configuración específica de usuarios en la plataforma.'),
(1, 2, 'Parametrizacion de módulos', 'Configuración inicial o ajustes de los diferentes módulos del sistema.'),
(1, 2, 'Parametrización y permisos de Roles', 'Gestión de roles y asignación de permisos en la plataforma.'),
(1, 1, 'Caida plataforma', 'Notificación de caída o inoperabilidad total de la plataforma.'),
(1, 2, 'Fallas operativas con Modulos especificos', 'Problemas operativos detectados en módulos específicos.'),
(1, 2, 'Parametrización y ajuste servicios / medicamentos', 'Gestión y ajustes de parametrización de servicios o medicamentos en el sistema.'),
(1, 2, 'Parametrización y ajuste de CUPS', 'Actualización y configuración del listado de CUPS.'),
(1, 2, 'Parametrización y ajuste de CUMS', 'Ajustes y mantenimiento del listado de CUMS.'),
(1, 2, 'Error en cargue de archivos adjuntos', 'Problemas al cargar archivos adjuntos en el sistema.'),
(1, 2, 'Error de funcionalidad Módulo Cuentas medicas', 'Errores detectados en el funcionamiento del módulo de cuentas médicas.'),
(1, 2, 'Error de funcionalidad Módulo RIPS', 'Errores funcionales dentro del módulo RIPS.'),
(1, 2, 'Error de contenido paquete rips', 'Problemas relacionados con la estructura o contenido del paquete RIPS.'),
(1, 2, 'Error cargue de RIPS', 'Errores presentados durante el cargue de archivos RIPS.'),
(1, 2, 'Notificacion de correos', 'Problemas o incidencias relacionadas con el envío o recepción de correos.');

INSERT INTO categorias (id_area, nombre, id_prioridad, descripcion)
VALUES
(2, 'Requerimientos de desarrollo', 2, 'Solicitudes relacionadas con nuevos desarrollos y funcionalidades.'),
(2, 'Requerimientos de Controles de cambio', 2, 'Gestión y documentación de cambios en los sistemas existentes.'),
(2, 'Ajustes post desarrollo', 2, 'Correcciones y optimizaciones después de la fase de desarrollo inicial.'),
(2, 'Ajustes post pruebas técnicas y funcionales', 2, 'Modificaciones necesarias tras la realización de pruebas técnicas y funcionales.'),
(2, 'Solicitud de despligue al ambiente de pruebas', 2, 'Petición para desplegar el desarrollo en el entorno de pruebas.'),
(2, 'Solicitud de despligue al ambiente de producción', 2, 'Petición para desplegar el desarrollo en el entorno de producción.'),
(2, 'Integración con modulos de SUIM-HORUS', 2, 'Trabajos relacionados con la integración de módulos internos de SUIM-HORUS.'),
(2, 'Integración con Sistemas externos', 2, 'Solicitudes para integrar la aplicación con sistemas externos.'),
(2, 'Ajuste y actualiazción de Integraciones', 2, 'Mejoras y actualizaciones sobre integraciones ya implementadas.');

INSERT INTO categorias (id_area, nombre, id_prioridad, descripcion)
VALUES
(3, 'Solicitud de informes - reportes', 2, 'Solicitudes para la generación de informes y reportes personalizados.'),
(3, 'Parametrización de Bases de datos', 1, 'Configuración y ajuste de parámetros en las bases de datos.'),
(3, 'Ajuste de Bases de datos', 2, 'Correcciones y optimizaciones en la estructura o contenido de las bases de datos.'),
(3, 'Backup de Bases de datos', 1, 'Realización y gestión de copias de seguridad de las bases de datos.'),
(3, 'Parametrización de Estadisticas - Dash board', 2, 'Configuración y ajuste de paneles estadísticos y dashboards.'),
(3, 'Ajustes de Estadisticas - Dash board', 2, 'Correcciones y mejoras en paneles estadísticos y dashboards existentes.'),
(3, 'Ajuste / parametrización de estructura de Reportes', 3, 'Configuración y ajustes de la estructura para reportes personalizados.'),
(3, 'Generación de reportes', 2, 'Producción y entrega de reportes solicitados.');

INSERT INTO categorias (id_area, nombre, id_prioridad, descripcion)
VALUES
(4, 'Incidentes de la infraestructura', 1, 'Reportes de fallos o problemas críticos en la infraestructura tecnológica.'),
(4, 'Solicitud de informes de indisponibilidad', 2, 'Requerimiento de reportes sobre tiempos de indisponibilidad de los servicios.'),
(4, 'Solicitud de informes de Seguridad de la información', 3, 'Peticiones para la generación de informes relacionados con la seguridad de la información.'),
(4, 'Pruebas de Seguridad de la información', 2, 'Solicitudes para realizar pruebas de vulnerabilidad y seguridad.'),
(4, 'Solicitud de actividades de Seguridad de la información', 3, 'Requerimientos para ejecutar actividades específicas en materia de seguridad de la información.'),
(4, 'Documentación sobre Seguridad de la información', 3, 'Generación y entrega de documentación referente a la seguridad de la información.'),
(4, 'Validación de la velocidad de la plataforma', 3, 'Solicitudes para evaluar y medir la velocidad de respuesta de la plataforma.'),
(4, 'Inconsistencias con el Captcha', 1, 'Reportes sobre errores o problemas relacionados con el funcionamiento del Captcha.'),
(4, 'Inconsistencias de ingreso plataforma (seguridad)', 1, 'Problemas de acceso relacionados con la seguridad en la plataforma.');

INSERT INTO campos_tickets (id_categoria, nombre_campo, tipo_campo, requerido)
VALUES
(1, 'Archivo adjunto', 'archivo', FALSE),
(2, 'Archivo adjunto', 'archivo', FALSE),
(3, 'Archivo adjunto', 'archivo', FALSE),
(4, 'Archivo adjunto', 'archivo', FALSE),
(5, 'Archivo adjunto', 'archivo', FALSE),
(6, 'Archivo adjunto', 'archivo', FALSE),
(7, 'Archivo adjunto', 'archivo', FALSE),
(8, 'Archivo adjunto', 'archivo', FALSE),
(9, 'Archivo adjunto', 'archivo', FALSE),
(10, 'Archivo adjunto', 'archivo', FALSE),
(11, 'Archivo adjunto', 'archivo', FALSE),
(12, 'Archivo adjunto', 'archivo', FALSE),
(13, 'Archivo adjunto', 'archivo', FALSE),
(14, 'Archivo adjunto', 'archivo', FALSE),
(15, 'Archivo adjunto', 'archivo', FALSE),
(16, 'Archivo adjunto', 'archivo', FALSE),
(20, 'Archivo adjunto', 'archivo', FALSE),
(21, 'Archivo adjunto', 'archivo', FALSE),
(22, 'Archivo adjunto', 'archivo', FALSE),
(23, 'Archivo adjunto', 'archivo', FALSE),
(24, 'Archivo adjunto', 'archivo', FALSE),
(25, 'Archivo adjunto', 'archivo', FALSE),
(26, 'Archivo adjunto', 'archivo', FALSE),
(27, 'Archivo adjunto', 'archivo', FALSE),
(28, 'Archivo adjunto', 'archivo', FALSE),
(29, 'Archivo adjunto', 'archivo', FALSE),
(30, 'Archivo adjunto', 'archivo', FALSE),
(31, 'Archivo adjunto', 'archivo', FALSE),
(32, 'Archivo adjunto', 'archivo', FALSE),
(33, 'Archivo adjunto', 'archivo', FALSE),
(34, 'Archivo adjunto', 'archivo', FALSE),
(35, 'Archivo adjunto', 'archivo', FALSE),
(36, 'Archivo adjunto', 'archivo', FALSE),
(37, 'Archivo adjunto', 'archivo', FALSE),
(38, 'Archivo adjunto', 'archivo', FALSE),
(39, 'Archivo adjunto', 'archivo', FALSE),
(40, 'Archivo adjunto', 'archivo', FALSE),
(41, 'Archivo adjunto', 'archivo', FALSE),
(42, 'Archivo adjunto', 'archivo', FALSE);

INSERT INTO campos_tickets(id_categoria, nombre_campo, tipo_campo, requerido)
VALUES
	(17, 'SOFTWARE/PLATAFORMA', 'texto', 1),
    (17, 'MÓDULOS/PROCESOS', 'texto', 1),
    (17, 'OBJETIVOS REQUERIMIENTO', 'textarea', 1),
    (17, 'JUSTIFICACIÓN REQUERIMIENTO', 'textarea', 1),
    (17, 'ALCANCE REQUERIMIENTO', 'textarea', 1),
    (17, 'REQUISITOS FUNCIONALES (Descripción del requerimiento)', 'textarea', 1),
    (17, 'PROCEDIMIENTO', 'archivo', 1),
    (17, 'NORMATIVIDAD', 'archivo', 1),
    (17, 'DIAGRAMAS DE FLUJO', 'archivo', 1),
    (17, 'TIPOLOGÍA DE CAMPOS', 'archivo', 1),
    (17, 'BASE DE DATOS', 'archivo', 0),
    (17, 'ESTRUCTURA DE REPORTES', 'archivo', 0),
    (17, 'FICHA DE INDICADORES', 'archivo', 0),
    (17, 'OTROS ARCHIVOS', 'archivo', 0);
    
INSERT INTO campos_tickets(id_categoria, nombre_campo, tipo_campo, requerido)
VALUES
	(18, 'SOFTWARE/PLATAFORMA', 'texto', 1),
    (18, 'MÓDULOS/PROCESOS', 'texto', 1),
    (18, 'OBJETIVOS REQUERIMIENTO', 'textarea', 1),
    (18, 'JUSTIFICACIÓN REQUERIMIENTO', 'textarea', 1),
    (18, 'ALCANCE REQUERIMIENTO', 'textarea', 1),
    (18, 'REQUISITOS FUNCIONALES (Descripción del requerimiento)', 'textarea', 1),
    (18, 'PROCEDIMIENTO', 'archivo', 1),
    (18, 'NORMATIVIDAD', 'archivo', 1),
    (18, 'DIAGRAMAS DE FLUJO', 'archivo', 1),
    (18, 'TIPOLOGÍA DE CAMPOS', 'archivo', 1),
    (18, 'BASE DE DATOS', 'archivo', 0),
    (18, 'ESTRUCTURA DE REPORTES', 'archivo', 0),
    (18, 'FICHA DE INDICADORES', 'archivo', 0),
    (18, 'OTROS ARCHIVOS', 'archivo', 0);
    
INSERT INTO campos_tickets(id_categoria, nombre_campo, tipo_campo, requerido)
VALUES
	(19, 'SOFTWARE/PLATAFORMA', 'texto', 1),
    (19, 'MÓDULOS/PROCESOS', 'texto', 1),
    (19, 'OBJETIVOS REQUERIMIENTO', 'textarea', 1),
    (19, 'JUSTIFICACIÓN REQUERIMIENTO', 'textarea', 1),
    (19, 'ALCANCE REQUERIMIENTO', 'textarea', 1),
    (19, 'REQUISITOS FUNCIONALES (Descripción del requerimiento)', 'textarea', 1),
    (19, 'PROCEDIMIENTO', 'archivo', 1),
    (19, 'NORMATIVIDAD', 'archivo', 1),
    (19, 'DIAGRAMAS DE FLUJO', 'archivo', 1),
    (19, 'TIPOLOGÍA DE CAMPOS', 'archivo', 1),
    (19, 'BASE DE DATOS', 'archivo', 0),
    (19, 'ESTRUCTURA DE REPORTES', 'archivo', 0),
    (19, 'FICHA DE INDICADORES', 'archivo', 0),
    (19, 'OTROS ARCHIVOS', 'archivo', 0);

INSERT INTO categoria_encargados (id_categoria, id_usuario)
VALUES
(1, 2), (1, 3),
(2, 3), (2, 4),
(3, 4), (3, 6),
(4, 6), (4, 7),
(5, 2), (5, 7),
(6, 2), (6, 3), (6, 4),
(7, 3), (7, 6),
(8, 4), (8, 7),
(9, 2), (9, 6),
(10, 3), (10, 7),
(11, 4), (11, 6), (11, 7),
(12, 2), (12, 3),
(13, 3), (13, 4),
(14, 4), (14, 6),
(15, 6), (15, 7),
(16, 2), (16, 7),
(17, 2), (17, 3), (17, 4),
(18, 3), (18, 6),
(19, 4), (19, 7),
(20, 2), (20, 6),
(21, 3), (21, 7),
(22, 4), (22, 6), (22, 7),
(23, 2), (23, 3),
(24, 3), (24, 4),
(25, 4), (25, 6),
(26, 6), (26, 7),
(27, 2), (27, 7),
(28, 2), (28, 3), (28, 4),
(29, 3), (29, 6),
(30, 4), (30, 7),
(31, 2), (31, 6),
(32, 3), (32, 7),
(33, 4), (33, 6), (33, 7),
(34, 2), (34, 3),
(35, 3), (35, 4),
(36, 4), (36, 6),
(37, 6), (37, 7),
(38, 2), (38, 7),
(39, 2), (39, 3), (39, 4),
(40, 3), (40, 6),
(41, 4), (41, 7),
(42, 2), (42, 6);
