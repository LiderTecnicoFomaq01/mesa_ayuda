const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const pool = require('../../dbConfig');

exports.processTicketCreation = async ({ ticketData, files }) => {
  let conn;
  try {
    // Validación básica
    if (!ticketData || !ticketData.id_categoria || !ticketData.id_usuario) {
      throw new Error('Datos del ticket incompletos');
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Insertar ticket principal
    const [ticketResult] = await conn.query(
      'INSERT INTO tickets (id_categoria, id_usuario, id_estado) VALUES (?, ?, ?)',
      [ticketData.id_categoria, ticketData.id_usuario, ticketData.id_estado || 1]
    );
    const ticketId = ticketResult.insertId;

    // Procesar campos dinámicos
    for (const [key, value] of Object.entries(ticketData.campos || {})) {
      if (key.startsWith('field_')) {
        const campoId = key.replace('field_', '');
        
        if (value !== null && value !== undefined && value !== '') {
          await conn.query(
            'INSERT INTO valores_campos (id_ticket, id_campo, valor) VALUES (?, ?, ?)',
            [ticketId, campoId, String(value)]
          );
        }
      }
    }

    // Procesar archivos adjuntos (adaptado para tu estructura de tabla)
    if (files && files.length > 0) {
      const uploadBaseDir = path.join(__dirname, '..', 'uploads');
      const ticketUploadDir = path.join(uploadBaseDir, ticketId.toString());

      try {
        // Asegurar directorios
        if (!fs.existsSync(uploadBaseDir)) {
          await fsPromises.mkdir(uploadBaseDir, { recursive: true });
        }
        await fsPromises.mkdir(ticketUploadDir, { recursive: true });

        for (const file of files) {
          if (!file.path || !fs.existsSync(file.path)) {
            console.error(`Archivo temporal no encontrado: ${file.path}`);
            continue;
          }

          // Corregir encoding del nombre del archivo
          const correctedName = Buffer.from(file.originalname, 'binary').toString('utf8');
          const safeFileName = correctedName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const newPath = path.join(ticketUploadDir, safeFileName);

          // Mover archivo
          await fsPromises.rename(file.path, newPath);
          console.log(`Archivo movido exitosamente a: ${newPath}`);

          // Insertar metadatos (sin id_campo)
          await conn.query(
            'INSERT INTO ticket_archivos (id_ticket, ruta_archivo, nombre_original) VALUES (?, ?, ?)',
            [ticketId, newPath, correctedName]
          );
        }
      } catch (dirError) {
        console.error('Error al crear directorios:', dirError);
        throw new Error('Error al preparar el almacenamiento para archivos adjuntos');
      }
    }

    await conn.commit();
    return { success: true, ticketId };
    
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error en processTicketCreation:', error);
    
    // Limpieza de archivos temporales
    if (files) {
      for (const file of files) {
        if (file.path && fs.existsSync(file.path)) {
          try {
            await fsPromises.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error al limpiar archivo temporal:', unlinkError);
          }
        }
      }
    }
    
    throw error;
  } finally {
    if (conn) conn.release();
  }
};