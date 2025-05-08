const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/misAsignadasTicketsController');

router.get('/misAsignadasTickets/:usuarioId', ticketController.getMisTickets);

module.exports = router;
