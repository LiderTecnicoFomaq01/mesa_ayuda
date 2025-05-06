const db = require('../../dbConfig');

const getTicketsByUserId = async (usuarioId) => {
  const [rows] = await db.query(`
    SELECT 
      t.id AS radicado,
      c.nombre AS categoria,
      et.nombre_estado AS estado,
      t.fecha_creacion AS fecha_creacion,
      pt.nombre_prioridad AS prioridad
    FROM tickets t
    JOIN categorias c ON c.id = t.id_categoria
    JOIN estados_ticket et ON et.id = t.id_estado
    JOIN prioridades_ticket pt ON pt.id = c.id_prioridad
    WHERE t.id_usuario = ?
  `, [usuarioId]);

  return rows;
};

module.exports = {
  getTicketsByUserId
};
