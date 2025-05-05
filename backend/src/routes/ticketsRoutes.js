const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const upload = require('../config/multerConfig');

router.post('/', upload.any(), ticketsController.createTicket);

module.exports = router;