const db = require('../../dbConfig');

const getTicketsByUserId = async (usuarioId) => {
  const [rows] = await db.query(`
    SELECT 
      UPPER(t.id) AS radicado,
      UPPER(a.nombre) AS area,
      UPPER(c.nombre) AS categoria,
      UPPER(et.nombre_estado) AS estado,
      UPPER(t.fecha_creacion) AS fecha_creacion,
      UPPER(pt.nombre_prioridad) AS prioridad,
      UPPER(pt.tiempo_min_horas) AS tiempo_verde,
      UPPER(pt.tiempo_max_horas) AS tiempo_amarillo
    FROM tickets t
    JOIN categorias c ON c.id = t.id_categoria
    JOIN areas a ON a.id = c.id_area
    JOIN estados_ticket et ON et.id = t.id_estado
    JOIN prioridades_ticket pt ON pt.id = c.id_prioridad
    WHERE t.id_usuario = ?
    ORDER BY t.fecha_creacion DESC;

  `, [usuarioId]);

  return rows;
};

module.exports = {
  getTicketsByUserId
};
