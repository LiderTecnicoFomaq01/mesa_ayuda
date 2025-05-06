const express = require('express');
const router = express.Router();
const filtrosService = require('../services/filtrosService');

router.get('/areas', async (req, res) => {
    try {
        const areas = await filtrosService.getAreas();
        res.json(areas);
    } catch (error) {
        console.error('Error al obtener áreas:', error);
        res.status(500).json({ error: 'Error al obtener áreas' });
    }
});

router.get('/estados', async (req, res) => {
    try {
        const estados = await filtrosService.getEstados();
        res.json(estados);
    } catch (error) {
        console.error('Error al obtener estados:', error);
        res.status(500).json({ error: 'Error al obtener estados' });
    }
});

router.get('/categorias', async (req, res) => {
    try {
        const areaId = req.query.area_id || null;
        console.log('🟡 Consultando categorías para área ID:', areaId);
        const categorias = await filtrosService.getCategorias(areaId);
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

module.exports = router;
