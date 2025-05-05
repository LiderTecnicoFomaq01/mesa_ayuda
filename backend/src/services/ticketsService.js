// services/ticketsService.js
const fs = require('fs');
const path = require('path');
const pool = require('../../dbConfig');

exports.processTicketCreation = async ({ ticketData, files, fileInfo }) => {
  let conn;
  try {
    // 1. Obtener conexión
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 2. Insertar ticket principal
    const [ticketResult] = await conn.query(
      'INSERT INTO tickets (id_categoria, id_usuario, id_estado) VALUES (?, ?, ?)',
      [ticketData.id_categoria, ticketData.id_usuario, ticketData.id_estado || 1]
    );
    const ticketId = ticketResult.insertId;

    // 3. Procesar campos dinámicos (excepto archivos)
    for (const [key, value] of Object.entries(ticketData.campos || {})) {
      if (key.startsWith('field_')) {
        const campoId = key.replace('field_', '');

        // Solo insertar si el valor es un string no vacío (evita insertar objetos vacíos como los archivos)
        if (typeof value === 'string' && value.trim() !== '') {
          await conn.query(
            'INSERT INTO valores_campos (id_ticket, id_campo, valor) VALUES (?, ?, ?)',
            [ticketId, campoId, value]
          );
        }
      }
    }

    // 4. Procesar archivos
    if (files.length > 0) {
      const uploadDir = path.join(__dirname, '..', 'uploads', ticketId.toString());
      fs.mkdirSync(uploadDir, { recursive: true });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const meta = fileInfo[i];

        const newPath = path.join(uploadDir, file.originalname);
        fs.renameSync(file.path, newPath);

        await conn.query(
          'INSERT INTO ticket_archivos (id_ticket, id_campo, ruta_archivo, nombre_original) VALUES (?, ?, ?, ?)',
          [ticketId, meta.id_campo || null, newPath, file.originalname]
        );
      }
    }

    await conn.commit();
    conn.release();

    return { success: true, ticketId };
  } catch (error) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    console.error('Error en processTicketCreation:', error);
    throw error;
  }
};
