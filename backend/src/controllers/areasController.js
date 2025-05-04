const areasService = require('../services/areasService');

exports.obtenerAreas = async (req, res) => {
    try {
        const areas = await areasService.obtenerAreas();
        res.json(areas);
    } catch (error) {
        console.error("Error al obtener áreas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.obtenerCategoriasPorArea = async (req, res) => {
    try {
        const { idArea } = req.params;
        if (!idArea) return res.status(400).json({ message: "ID de área requerido" });

        const categorias = await areasService.obtenerCategoriasPorArea(idArea);
        res.json(categorias);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
