const combosService = require('../services/filtrosService');

const getAreas = async (req, res) => {
    try {
        const areas = await combosService.getAreas();
        res.json(areas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener áreas' });
    }
};

const getEstados = async (req, res) => {
    try {
        const estados = await combosService.getEstados();
        res.json(estados);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estados' });
    }
};

const getCategorias = async (req, res) => {
    const areaId = req.query.area_id || null;  // Obtiene el area_id del query string
    try {
        const categorias = await combosService.getCategorias(areaId); // Llama al servicio con el área
        res.json(categorias); // Devuelve las categorías filtradas
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

module.exports = {
    getAreas,
    getEstados,
    getCategorias
};
