const express = require('express');
const router = express.Router();
const filtrosController = require('../controllers/filtrosController');

router.get('/areas', filtrosController.getAreas);
router.get('/usuarios', filtrosController.getUsuarios);
router.get('/estados', filtrosController.getEstados);
router.get('/categorias', filtrosController.getCategorias);

module.exports = router;
