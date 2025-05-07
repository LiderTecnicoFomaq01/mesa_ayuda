const db = require('../../dbConfig');

const getAreas = async () => {
    const [rows] = await db.query('SELECT id, UPPER(nombre) AS nombre FROM areas');
    return rows;
};

const getEstados = async () => {
    const [rows] = await db.query('SELECT id, UPPER(nombre_estado) AS nombre_estado FROM estados_ticket');
    return rows;
};

const getCategorias = async (areaId = null) => {
    let query = 'SELECT id, UPPER(nombre) AS nombre FROM categorias';
    const params = [];

    if (areaId) {
        query += ' WHERE id_area = ?'; // Filtra por área si se proporciona
        params.push(areaId);
    }

    console.log("Consulta ejecutada:", query); // Muestra la consulta SQL para verificarla

    const [rows] = await db.query(query, params); // Ejecuta la consulta con los parámetros
    return rows; // Devuelve las categorías obtenidas
};

module.exports = {
    getAreas,
    getEstados,
    getCategorias
};
