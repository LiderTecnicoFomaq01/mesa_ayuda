// routes/respuestas.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const respuestaController = require('../controllers/respuestaController');

router.post('/', upload.any(), respuestaController.crearRespuesta);

module.exports = router;
