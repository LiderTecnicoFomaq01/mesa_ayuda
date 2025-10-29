const db = require('../../dbConfig');

const getTicketsByUserId = async (usuarioId) => {
  const [rows] = await db.query(`
        SELECT 
            t.id AS radicado,
            a.nombre AS area,
            c.nombre AS categoria,
            et.nombre_estado AS estado,
            t.fecha_creacion AS fecha_creacion,
            t.asunto AS asunto,
            t.hora_solucion AS hora_solucion,
            t.fecha_inicio_en_curso AS fecha_inicio_en_curso,
            t.contador_horas AS contador_horas,
            pt.nombre_prioridad AS prioridad,
            pt.tiempo_min_horas AS tiempo_verde,
            pt.tiempo_max_horas AS tiempo_amarillo
        FROM tickets t
        JOIN categorias c ON c.id = t.id_categoria
        JOIN areas a ON a.id = c.id_area
        JOIN estados_ticket et ON et.id = t.id_estado
        JOIN prioridades_ticket pt ON pt.id = c.id_prioridad
        JOIN asignaciones_ticket atk ON atk.id_ticket = t.id
        WHERE et.id NOT IN (3, 4, 5)
        AND atk.id_usuario = ?
        ORDER BY t.fecha_creacion DESC;

  `, [usuarioId]);

  return rows;
};

module.exports = {
  getTicketsByUserId
};
