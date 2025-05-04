const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areasController');

// Rutas existentes
router.get('/', areasController.obtenerAreas);
router.get('/:idArea/categorias', areasController.obtenerCategoriasPorArea);

// Nueva ruta para obtener campos por categoría
router.get('/:id/campos', areasController.getCamposByCategoria);

module.exports = router;
