const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const pool = require('../../dbConfig');

exports.processTicketCreation = async ({ ticketData, files }) => {
  let conn;
  try {
    // Validación básica
    if (!ticketData || !ticketData.id_categoria || !ticketData.id_usuario || !ticketData.asunto) {
      throw new Error('Datos del ticket incompletos');
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const asunto = (ticketData.asunto || 'Sin asunto').toString().trim();
    const descripcion = (ticketData.descripcion || 'Sin descripcion').toString().trim();

    const [ticketResult] = await conn.query(
      
      'INSERT INTO tickets (id_categoria, id_usuario, id_estado, asunto, descripcion_caso) VALUES (?, ?, ?, ?, ?)',
      [
        ticketData.id_categoria,
        ticketData.id_usuario,
        ticketData.id_estado || 2,
        asunto,
        descripcion
      ]
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

    // Buscar encargados y su cantidad de tickets asignados (por esa categoría)
    const [encargados] = await conn.query(
      `
      SELECT ce.id_usuario, ce.contador_tickets
      FROM categoria_encargados ce
      WHERE ce.id_categoria = ?
      ORDER BY ce.contador_tickets ASC, ce.fecha_asignacion ASC
      LIMIT 1
      `,
      [ticketData.id_categoria]
    );

    if (encargados.length === 0) {
      console.warn(`No hay encargados para la categoría ID ${ticketData.id_categoria}`);
    } else {
      const encargado = encargados[0];

      // Insertar la asignación
      await conn.query(
        'INSERT INTO asignaciones_ticket (id_ticket, id_usuario) VALUES (?, ?)',
        [ticketId, encargado.id_usuario]
      );

      // Incrementar el contador en categoria_encargados
      await conn.query(
        `
        UPDATE categoria_encargados
        SET contador_tickets = contador_tickets + 1
        WHERE id_categoria = ? AND id_usuario = ?
        `,
        [ticketData.id_categoria, encargado.id_usuario]
      );

      console.log(`Ticket asignado equitativamente al usuario ID: ${encargado.id_usuario}`);
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