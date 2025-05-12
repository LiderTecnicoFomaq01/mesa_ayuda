const db = require('../../dbConfig'); // Ajusta según tu estructura

exports.getFullTicketDetails = async (ticketId) => {
    const queryTicket = `
        SELECT 
            u.primer_nombre AS nombre,
            u.primer_apellido AS apellido,
            u.email AS email,
            t.id AS radicado,
            t.asunto AS asunto,
            t.descripcion_caso AS descripcion,
            a.nombre AS area,
            c.nombre AS categoria,
            et.nombre_estado AS estado,
            t.fecha_creacion AS fecha_creacion,
            pt.nombre_prioridad AS prioridad
        FROM tickets t
        JOIN usuarios u ON u.id = t.id_usuario
        JOIN categorias c ON c.id = t.id_categoria
        JOIN areas a ON a.id = c.id_area
        JOIN estados_ticket et ON et.id = t.id_estado
        JOIN prioridades_ticket pt ON pt.id = c.id_prioridad
        WHERE t.id = ?;
    `;

    const queryCampos = `
        SELECT
            ct.nombre_campo AS nombre_campo,
            vc.valor AS valor_campo
        FROM campos_tickets ct
        LEFT JOIN valores_campos vc ON vc.id_campo = ct.id AND vc.id_ticket = ?
        WHERE ct.id_categoria = (SELECT id_categoria FROM tickets WHERE id = ?);
    `;

    const queryArchivos = `
        SELECT
            nombre_original AS nombre_archivo,
            ruta_archivo
        FROM ticket_archivos
        WHERE id_ticket = ?;
    `;

    const queryRespuestas = `
        SELECT
            r.id,
            r.id_usuario AS id_usuario,
            u.primer_nombre AS nombre_usuario,
            u.primer_apellido AS apellido_usuario,
            r.mensaje,
            r.ruta_archivo,
            r.fecha_respuesta
        FROM respuestas_ticket r
        JOIN usuarios u ON u.id = r.id_usuario
        WHERE r.id_ticket = ?
        ORDER BY r.fecha_respuesta ASC;
    `;

    const [ticketRows] = await db.query(queryTicket, [ticketId]);
    const [camposRows] = await db.query(queryCampos, [ticketId, ticketId]);
    const [archivosRows] = await db.query(queryArchivos, [ticketId]);
    const [respuestasRows] = await db.query(queryRespuestas, [ticketId]);

    if (ticketRows.length === 0) {
        throw new Error('Ticket no encontrado');
    }

    return {
        ticket: ticketRows[0],
        campos: camposRows,
        archivos: archivosRows,
        respuestas: respuestasRows
    };
};
