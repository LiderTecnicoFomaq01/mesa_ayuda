const express = require('express');
const router = express.Router();
const cambioEstadoController = require('../controllers/cambioEstadoController');

// Ruta para cambiar el estado del ticket
router.post('/cambiar-estado', cambioEstadoController.cambiarEstado);

module.exports = router;
