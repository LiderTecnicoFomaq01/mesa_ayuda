const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const pool = require('../../dbConfig');

exports.processTicketCreation = async ({ ticketData, files, fileInfos }) => {
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

    // 1) Crear el ticket
    const [ticketResult] = await conn.query(
      'INSERT INTO tickets (id_categoria, id_usuario, id_estado, asunto, descripcion_caso) VALUES (?, ?, ?, ?, ?)',
      [ticketData.id_categoria, ticketData.id_usuario, ticketData.id_estado || 2, asunto, descripcion]
    );
    const ticketId = ticketResult.insertId;

    // 2) Detectar campos con archivos (por si quieres excluirlos en valores NO-archivo)
    const camposConArchivo = new Set();
    (fileInfos || []).forEach(info => {
      if (info?.id_campo != null) camposConArchivo.add(String(info.id_campo));
    });

    // 3) Guardar valores de campos NO archivo
    for (const [key, value] of Object.entries(ticketData.campos || {})) {
      if (!key.startsWith('field_')) continue;
      const campoId = key.replace('field_', '');
      if (value != null && value !== '' && !camposConArchivo.has(campoId)) {
        await conn.query(
          'INSERT INTO valores_campos (id_ticket, id_campo, valor) VALUES (?, ?, ?)',
          [ticketId, campoId, String(value)]
        );
      }
    }

    // 4) Procesar y guardar archivos
    const rutasPorCampo = {};

    if (files && files.length > 0) {
      const uploadBaseDir = path.join(__dirname, '..', 'uploads');
      const ticketUploadDir = path.join(uploadBaseDir, String(ticketId));

      if (!fs.existsSync(uploadBaseDir)) {
        await fsPromises.mkdir(uploadBaseDir, { recursive: true });
      }
      await fsPromises.mkdir(ticketUploadDir, { recursive: true });

      for (const file of files) {
        // 4.1) Extraer id_campo desde file.fieldname
        // Se aceptan nombres "field_{id}" o solo el ID numerico
        const match = file.fieldname.match(/^(?:field_)?(\d+)$/);
        const idCampo = match ? match[1] : null;

        if (!file.path || !fs.existsSync(file.path)) {
          console.error(`Archivo temporal no encontrado: ${file.path}`);
          continue;
        }

        // 4.2) Normalizar nombre y mover archivo
        const correctedName = Buffer.from(file.originalname, 'binary').toString('utf8');
        const safeName = correctedName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const destPath = path.join(ticketUploadDir, safeName);
        await fsPromises.rename(file.path, destPath);

        // 4.3) Insertar en ticket_archivos
        await conn.query(
          'INSERT INTO ticket_archivos (id_ticket, id_campo, ruta_archivo, nombre_original) VALUES (?, ?, ?, ?)',
          [ticketId, idCampo, destPath, correctedName]
        );

        // 4.4) Agrupar rutas para later insertar en valores_campos
        if (idCampo != null) {
          if (!rutasPorCampo[idCampo]) rutasPorCampo[idCampo] = [];
          rutasPorCampo[idCampo].push(destPath);
        }
      }
    }

    // 4c) Insertar JSON con rutas en valores_campos
    for (const [campoId, rutas] of Object.entries(rutasPorCampo)) {
      await conn.query(
        `INSERT INTO valores_campos (id_ticket, id_campo, valor)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
        [ticketId, campoId, JSON.stringify(rutas)]
      );
    }

    // 5) Asignación automática de responsable
    const [encargados] = await conn.query(
      `SELECT id_usuario, contador_tickets
       FROM categoria_encargados
       WHERE id_categoria = ?
       ORDER BY contador_tickets ASC, fecha_asignacion ASC
       LIMIT 1`,
      [ticketData.id_categoria]
    );

    if (encargados.length) {
      const { id_usuario } = encargados[0];
      await conn.query(
        'INSERT INTO asignaciones_ticket (id_ticket, id_usuario) VALUES (?, ?)',
        [ticketId, id_usuario]
      );
      await conn.query(
        `UPDATE categoria_encargados
         SET contador_tickets = contador_tickets + 1
         WHERE id_categoria = ? AND id_usuario = ?`,
        [ticketData.id_categoria, id_usuario]
      );
    } else {
      console.warn(`Sin encargados para categoría ${ticketData.id_categoria}`);
    }

    await conn.commit();
    return { success: true, ticketId };
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error en processTicketCreation:', err);

    // Limpiar archivos temporales si algo falla
    if (files) {
      for (const f of files) {
        if (f.path && fs.existsSync(f.path)) {
          await fsPromises.unlink(f.path).catch(() => {});
        }
      }
    }
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
