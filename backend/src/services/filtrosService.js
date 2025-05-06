const db = require('../../dbConfig');

const getAreas = async () => {
    const [rows] = await db.query('SELECT id, nombre FROM areas');
    return rows;
};

const getEstados = async () => {
    const [rows] = await db.query('SELECT id, nombre_estado FROM estados_ticket');
    return rows;
};

const getCategorias = async () => {
    const [rows] = await db.query('SELECT id, nombre FROM categorias');
    return rows;
};

module.exports = {
    getAreas,
    getEstados,
    getCategorias
};
