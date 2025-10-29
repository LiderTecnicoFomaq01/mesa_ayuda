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
  usuario VARCHAR(50) NOT NULL UNIQUE,
  primer_nombre VARCHAR(100),
  segundo_nombre VARCHAR(100),
  primer_apellido VARCHAR(100),
  segundo_apellido VARCHAR(100),
  email VARCHAR(100),
  celular VARCHAR(20),
  acepta_datos BOOLEAN DEFAULT FALSE,
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
  descripcion_caso TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  hora_solucion TIMESTAMP NULL,
  fecha_inicio_en_curso TIMESTAMP NULL,
  contador_horas INT DEFAULT 0,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_estado) REFERENCES estados_ticket(id)
) ENGINE=InnoDB;


-- Tabla de campos para tickets
CREATE TABLE campos_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  nombre_campo VARCHAR(255) NOT NULL,
  tipo_campo ENUM('texto', 'numero', 'fecha', 'archivo', 'booleano', 'email', 'textarea') NOT NULL,
  requerido BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id)
) ENGINE=InnoDB;

CREATE TABLE categoria_encargados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  id_usuario INT NOT NULL,
  contador_tickets INT DEFAULT 0,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  UNIQUE KEY (id_categoria, id_usuario)
) ENGINE=InnoDB;

CREATE TABLE asignaciones_ticket (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ticket INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ticket) REFERENCES tickets(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

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
  interno BOOLEAN NOT NULL DEFAULT FALSE,
  ruta_archivo VARCHAR(255),
  fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- Tabla de encuestas de satisfacción
CREATE TABLE encuestas_satisfaccion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  q1 ENUM('si','no') NOT NULL,
  q3 INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla para almacenar tokens JWT invalidados
CREATE TABLE jwt_blacklist (
  token VARCHAR(500) PRIMARY KEY,
  expires_at DATETIME NOT NULL
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

INSERT INTO areas(nombre, descripcion) VALUES
('soporte', 'solicitudes de correo, usuarios e incidentes con la plataforma'),
('desarrollo', 'Desarrollos, cambios y ajustes de software'),
('gestión de datos', 'Bases de datos, reportes y estadisticas'),
('infraestructura', 'Seguridad de la plataforma');

INSERT INTO estados_ticket(nombre_estado, descripcion) VALUES
('en curso', 'Ticket asignado y en proceso de resolución'),
('pendiente', 'Ticket en espera de información o acción del equipo de soporte'),
('resuelto', 'Ticket concluido y a espera de cierre por parte del usuario'),
('finalizado', 'Ticket completado y cerrado'),
('cancelado', 'Ticket cancelado por el usuario o administrador');

INSERT INTO prioridades_ticket(nombre_prioridad, descripcion, tiempo_min_horas, tiempo_max_horas) VALUES
('alta', 'Problema que afecta a varios usuarios o funciones importantes', 2, 4),
('media', 'Problema que afecta a un usuario o función no crítica', 8, 24),
('baja', 'Solicitud de mejora o problema menor', 36, 48);

