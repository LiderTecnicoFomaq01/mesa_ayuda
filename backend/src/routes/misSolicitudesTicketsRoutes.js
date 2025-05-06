const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/misSolicitudesTicketsController');

router.get('/misSolicitudesTickets/:usuarioId', ticketController.getMisTickets);

module.exports = router;
