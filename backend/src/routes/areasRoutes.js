const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areasController');

router.get('/', areasController.obtenerAreas);
router.get('/:idArea/categorias', areasController.obtenerCategoriasPorArea);

module.exports = router;
