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
    try {
        const categorias = await combosService.getCategorias();
        res.json(categorias);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

module.exports = {
    getAreas,
    getEstados,
    getCategorias
};
