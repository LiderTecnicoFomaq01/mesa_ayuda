const db = require('../../dbConfig');

exports.createTicket = async (ticketData) => {
    const { id_categoria, id_usuario, id_estado } = ticketData;
    
    const [result] = await db.query(
        'INSERT INTO tickets (id_categoria, id_usuario, id_estado) VALUES (?, ?, ?)',
        [id_categoria, id_usuario, id_estado]
    );
    
    return result.insertId;
};