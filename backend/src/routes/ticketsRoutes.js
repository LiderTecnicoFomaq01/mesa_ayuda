const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/',  ticketsController.createTicket);

module.exports = router;