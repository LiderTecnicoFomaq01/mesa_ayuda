const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/solicitudesAtendidasController');

router.get('/solicitudesAtendidas/:usuarioId', ticketController.getMisTickets);

module.exports = router;
