const express = require('express');
const router = express.Router();
const cambioEstadoController = require('../controllers/cambioEstadoController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Ruta para cambiar el estado del ticket
router.post('/cambiar-estado', authenticateToken, cambioEstadoController.cambiarEstado);

module.exports = router;
