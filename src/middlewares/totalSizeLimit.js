const fs = require('fs');

const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB

module.exports = (req, res, next) => {
  const files = req.files || [];
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  if (totalSize > MAX_TOTAL_SIZE) {
    files.forEach(f => {
      if (f.path && fs.existsSync(f.path)) {
        fs.unlink(f.path, () => {});
      }
    });
    return res.status(400).json({
      error: 'El tamaño total de los archivos supera el límite de 5MB'
    });
  }

  next();
};
