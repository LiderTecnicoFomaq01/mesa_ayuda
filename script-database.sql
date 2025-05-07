-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS mesa_ayuda 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mesa_ayuda;

-- Tabla de roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de tipos de documento
CREATE TABLE tipo_documento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  abreviatura VARCHAR(10),
  descripcion VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_documento_id INT,
  numero_documento VARCHAR(10),
  primer_nombre VARCHAR(100) NOT NULL,
  segundo_nombre VARCHAR(100),
  primer_apellido VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP NULL,
  intentos_fallidos INT DEFAULT 0,
  bloqueado BOOLEAN DEFAULT FALSE,
  fecha_desbloqueo TIMESTAMP NULL,
  FOREIGN KEY (rol_id) REFERENCES roles(id),
  FOREIGN KEY (tipo_documento_id) REFERENCES tipo_documento(id),
  UNIQUE KEY (tipo_documento_id, numero_documento)
) ENGINE=InnoDB;

-- Tabla de áreas
CREATE TABLE areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
) ENGINE=InnoDB;

-- Tabla de estados de ticket
CREATE TABLE estados_ticket (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT
) ENGINE=InnoDB;

-- Tabla de prioridades de ticket
CREATE TABLE prioridades_ticket (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_prioridad VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  tiempo_min_horas INT NOT NULL,
  tiempo_max_horas INT NOT NULL
) ENGINE=InnoDB;

-- Tabla de categorías
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_area INT NOT NULL,
  id_prioridad INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_area) REFERENCES areas(id),
  FOREIGN KEY (id_prioridad) REFERENCES prioridades_ticket(id)
) ENGINE=InnoDB;

-- Tabla de tickets
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  id_usuario INT NOT NULL,
  id_estado INT NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_estado) REFERENCES estados_ticket(id)
) ENGINE=InnoDB;

-- Tabla de campos para tickets
CREATE TABLE campos_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  nombre_campo VARCHAR(255) NOT NULL,
  tipo_campo ENUM('texto', 'numero', 'fecha', 'archivo', 'booleano', 'email') NOT NULL,
  requerido BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id)
) ENGINE=InnoDB;

-- Tabla de valores de campos
CREATE TABLE valores_campos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ticket INT NOT NULL,
  id_campo INT NOT NULL,
  valor TEXT,
  FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (id_campo) REFERENCES campos_tickets(id),
  UNIQUE KEY (id_ticket, id_campo)
) ENGINE=InnoDB;

-- Para archivos
CREATE TABLE ticket_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ticket INT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Tabla de respuestas a tickets
CREATE TABLE respuestas_ticket (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ticket INT NOT NULL,
  id_usuario INT NOT NULL,
  mensaje TEXT NOT NULL,
  ruta_archivo VARCHAR(255),
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- Insertar datos iniciales
INSERT INTO tipo_documento (nombre, abreviatura, descripcion) VALUES
('Cédula de Ciudadanía', 'CC', 'Documento de identificación para ciudadanos colombianos mayores de edad.'),
('Tarjeta de Identidad', 'TI', 'Documento de identificación para menores de edad colombianos.'),
('Cédula de Extranjería', 'CE', 'Documento de identificación para extranjeros residentes en Colombia.'),
('Pasaporte', 'PA', 'Documento de viaje emitido por un gobierno para sus ciudadanos.'),
('NIT', 'NIT', 'Número de Identificación Tributaria para personas jurídicas o naturales con actividad económica.'),
('Registro Civil de Nacimiento', 'RC', 'Documento de identidad para recién nacidos o niños menores de 7 años.'),
('Documento Extranjero', 'DE', 'Documento emitido por un país extranjero distinto a Colombia.'),
('Permiso Especial de Permanencia', 'PEP', 'Permiso temporal otorgado a ciudadanos venezolanos en Colombia.'),
('Permiso por Protección Temporal', 'PPT', 'Documento transitorio para migrantes venezolanos en Colombia.'),
('Número Único de Identificación Personal', 'NUIP', 'Número asignado a menores de edad que reemplaza la Tarjeta de Identidad.');

INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Rol con permisos completos sobre el sistema, incluyendo gestión de usuarios y configuración.'),
('usuario administrativo', 'Rol con permisos para gestionar tickets, asignar tareas y consultar reportes.'),
('usuario', 'Rol con permisos limitados, puede crear y consultar sus propios tickets.');

INSERT INTO usuarios (
  tipo_documento_id, numero_documento, primer_nombre, segundo_nombre,
  primer_apellido, segundo_apellido, email, contraseña, rol_id
) VALUES
(1, '100000001', 'Carlos', 'Andrés', 'Pérez', 'Gómez', 'admin1@correo.com', 'admin123', 1),
(4, 'P1234567', 'Luisa', NULL, 'Martínez', 'Díaz', 'usuario_admin1@correo.com', 'admin123', 2),
(3, 'CE9876543', 'Juan', 'Esteban', 'Córdoba', NULL, 'usuario_admin2@correo.com', 'admin123', 2),
(4, 'P7654321', 'María', 'Camila', 'Ruiz', 'Sánchez', 'usuario1@correo.com', 'usuario123', 3),
(1, '100000005', 'Diego', NULL, 'Fernández', 'López', 'usuario2@correo.com', 'usuario123', 3);

INSERT INTO areas(nombre, descripcion) VALUES
('soporte', 'Área encargada de brindar soporte técnico a usuarios'),
('desarrollo', 'Área encargada del desarrollo de software'),
('gestión de datos', 'Área encargada de la administración y análisis de datos'),
('infraestructura', 'Área encargada de la infraestructura tecnológica');

INSERT INTO estados_ticket(nombre_estado, descripcion) VALUES
('en curso', 'Ticket asignado y en proceso de resolución'),
('esperando soporte', 'Ticket en espera de información o acción del equipo de soporte'),
('resuelto', 'Ticket concluido y a espera de cierre por parte del usuario'),
('finalizado', 'Ticket completado y cerrado'),
('cancelado', 'Ticket cancelado por el usuario o administrador');

INSERT INTO prioridades_ticket(nombre_prioridad, descripcion, tiempo_min_horas, tiempo_max_horas) VALUES
('alta', 'Problema que afecta a varios usuarios o funciones importantes', 2, 4),
('media', 'Problema que afecta a un usuario o función no crítica', 8, 24),
('baja', 'Solicitud de mejora o problema menor', 36, 48);

INSERT INTO categorias(id_area, nombre, descripcion, id_prioridad) VALUES
(1, 'Pruebas', 'Categoría para tickets de prueba del sistema', 1),
(2, 'Desarrollo nuevo', 'Solicitudes de nuevos desarrollos', 3),
(3, 'Reportes', 'Generación de reportes especiales', 2),
(4, 'Hardware', 'Problemas con equipos físicos', 2);

INSERT INTO campos_tickets (id_categoria, nombre_campo, tipo_campo, requerido) VALUES
(1, 'RAZÓN SOCIAL DEL PRESTADOR / ENTIDAD / FARMACIA / INSUMO / OPERADOR LOGÍSTICO', 'texto', TRUE),
(1, 'NIT (sin dígito de verificación)', 'texto', TRUE),
(1, 'ADJUNTAR DOCUMENTO DE SOPORTE', 'archivo', FALSE),
(1, '¿REQUERIMIENTO URGENTE?', 'booleano', FALSE);
