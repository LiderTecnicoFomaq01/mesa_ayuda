const express = require('express');
const router = express.Router();
const satisfaccionController = require('../controllers/satisfaccionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/encuesta-satisfaccion', authenticateToken, satisfaccionController.guardarEncuesta);

module.exports = router;
