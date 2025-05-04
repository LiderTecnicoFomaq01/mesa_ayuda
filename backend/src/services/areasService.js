const db = require('../../dbConfig');

exports.obtenerAreas = async () => {
    const [rows] = await db.execute("SELECT id, nombre FROM areas");
    return rows;
};

exports.obtenerCategoriasPorArea = async (idArea) => {
    const [rows] = await db.execute("SELECT id, nombre FROM categorias WHERE id_area = ?", [idArea]);
    return rows;
};
