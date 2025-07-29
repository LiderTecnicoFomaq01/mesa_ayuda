const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areasController');

// Rutas existentes
router.get('/', areasController.obtenerAreas);
// Obtener las categorías de un área específica
router.get('/:idArea/categorias', areasController.obtenerCategoriasPorArea);

// Obtener los campos asociados a una categoría
router.get('/:idCategoria/campos', areasController.getCamposByCategoria);

module.exports = router;
