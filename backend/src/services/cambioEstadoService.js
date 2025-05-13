const db = require('../../dbConfig'); // Suponiendo que tienes una capa de acceso a la base de datos

const cambiarEstado = async (radicado, estado) => {
  const sql = `UPDATE tickets SET id_estado = ?, fecha_actualizacion = NOW() WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db.query(sql, [estado, radicado], (err, result) => {
      if (err) {
        console.error('Error al realizar el UPDATE:', err);
        reject(false); // Rechazamos la promesa si hay error
      } else {
        resolve(true); // Resolvemos la promesa si la actualización fue exitosa
      }
    });
  });
};

module.exports = {
  cambiarEstado,
};
