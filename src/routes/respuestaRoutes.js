// routes/respuestas.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const totalSizeLimit = require('../middlewares/totalSizeLimit');
const respuestaController = require('../controllers/respuestaController');

router.post('/', upload.any(), totalSizeLimit, respuestaController.crearRespuesta);

module.exports = router;
