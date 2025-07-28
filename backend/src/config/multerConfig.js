const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Utiliza el generador de UUID integrado de Node para evitar dependencias extra
const { randomUUID } = require('crypto');

// Directorio temporal (mejor manejo de rutas)
const tempDir = path.resolve(__dirname, '..', 'uploads', 'temp');

// Aseguramos que el directorio exista (con manejo de errores)
try {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Directorio temporal creado: ${tempDir}`);
  }
} catch (err) {
  console.error('Error al crear directorio temporal:', err);
  process.exit(1); // Salir si no podemos crear el directorio
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${fileExt}`; // Mejor que Date.now()
    cb(null, uniqueName);
  }
});

// Filtros de archivo (seguridad básica)
  // Se permiten imágenes, PDF, documentos y archivos comprimidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/x-zip-compressed', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configuración final de Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

module.exports = upload;
