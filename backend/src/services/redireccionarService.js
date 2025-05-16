const db = require('../../dbConfig'); // importa tu conexión/pool aquí

async function redireccionarTicket(ticketId, usuarioId, categoriaId) {
  const connection = await db.getConnection(); // o directamente db si usas pool

  try {
    await connection.beginTransaction();

    const updateAsignacion = `
      UPDATE asignaciones_ticket
      SET id_usuario = ?, fecha_asignacion = NOW()
      WHERE id_ticket = ?;
    `;
    await connection.execute(updateAsignacion, [usuarioId, ticketId]);

    const updateTicket = `
      UPDATE tickets
      SET id_categoria = ?, fecha_actualizacion = NOW()
      WHERE id = ?;
    `;
    await connection.execute(updateTicket, [categoriaId, ticketId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release(); // importante si estás usando pool
  }
}

module.exports = { redireccionarTicket };
