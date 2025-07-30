const areasService = require('../services/areasService');

module.exports = {
    obtenerAreas: async (req, res) => {
        try {
            const areas = await areasService.obtenerAreas();
            res.json(areas);
        } catch (error) {
            console.error("Error al obtener áreas:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    },

    obtenerCategoriasPorArea: async (req, res) => {
        try {
            const { idArea } = req.params;
            if (!idArea) return res.status(400).json({ message: "ID de área requerido" });

            const categorias = await areasService.obtenerCategoriasPorArea(idArea);
            res.json(categorias);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    },

    getCamposByCategoria: async (req, res) => {
        try {
            const { idCategoria } = req.params;
            const campos = await areasService.getCamposByCategoria(idCategoria);

            res.status(200).json({
                success: true,
                data: campos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};
