const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const pool = require('../../dbConfig');

exports.guardarRespuesta = async ({ id_ticket, id_usuario, mensaje, files, interno = false }) => {
  let conn;

  try {
    if (!id_ticket || !id_usuario || !mensaje) {
      throw new Error('Datos de respuesta incompletos');
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    let rutaArchivoRelativa = null;

    // Procesar archivos
    if (files && files.length > 0) {
      const baseDir = path.join(__dirname, '..', 'uploads');
      const ticketDir = path.join(baseDir, id_ticket.toString());

      // Crear carpeta si no existe
      if (!fs.existsSync(ticketDir)) {
        await fsPromises.mkdir(ticketDir, { recursive: true });
      }

      const file = files[0]; // Solo 1 archivo permitido por respuesta
      const originalName = Buffer.from(file.originalname, 'binary').toString('utf8');
      const safeFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destino = path.join(ticketDir, safeFileName);

      await fsPromises.rename(file.path, destino);

      // Ruta relativa para la base de datos
      rutaArchivoRelativa = path.relative(baseDir, destino).replace(/\\/g, '/');
    }

    const [resultado] = await conn.query(
      `INSERT INTO respuestas_ticket (id_ticket, id_usuario, mensaje, interno, ruta_archivo)
       VALUES (?, ?, ?, ?, ?)`,
      [id_ticket, id_usuario, mensaje, interno === true || interno === 'true' ? 1 : 0, rutaArchivoRelativa]
    );

    await conn.commit();

    return {
      success: true,
      id_respuesta: resultado.insertId,
      archivo: rutaArchivoRelativa,
    };
  } catch (error) {
    if (conn) await conn.rollback();

    // Limpieza si falló
    if (files && files.length > 0) {
      for (const f of files) {
        if (f.path && fs.existsSync(f.path)) {
          try {
            await fsPromises.unlink(f.path);
          } catch (unlinkErr) {
            console.error('Error al eliminar archivo temporal:', unlinkErr);
          }
        }
      }
    }

    throw error;
  } finally {
    if (conn) conn.release();
  }
};
