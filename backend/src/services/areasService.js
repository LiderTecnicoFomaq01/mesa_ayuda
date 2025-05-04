const db = require('../../dbConfig');

module.exports = {
    obtenerAreas: async () => {
        try {
            const [rows] = await db.execute("SELECT id, nombre FROM areas");
            return rows;
        } catch (error) {
            console.error('Error en obtenerAreas:', error);
            throw new Error('Error al obtener las áreas');
        }
    },

    obtenerCategoriasPorArea: async (idArea) => {
        try {
            const [rows] = await db.execute(
                "SELECT id, nombre FROM categorias WHERE id_area = ?", 
                [idArea]
            );
            return rows;
        } catch (error) {
            console.error('Error en obtenerCategoriasPorArea:', error);
            throw new Error('Error al obtener categorías por área');
        }
    },

    getCamposByCategoria: async (idCategoria) => {
        try {
            const [rows] = await db.execute(
                "SELECT * FROM campos_tickets WHERE id_categoria = ? ORDER BY id",
                [idCategoria]
            );
            return rows;
        } catch (error) {
            console.error('Error en getCamposByCategoria:', error);
            throw new Error(`Error al obtener campos: ${error.message}`);
        }
    }
};