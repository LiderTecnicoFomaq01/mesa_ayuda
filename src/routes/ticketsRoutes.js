const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const upload = require('../config/multerConfig');
const totalSizeLimit = require('../middlewares/totalSizeLimit');

router.post('/', upload.any(), totalSizeLimit, ticketsController.createTicket);

module.exports = router;