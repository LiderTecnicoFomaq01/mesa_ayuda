const express = require('express');
const { handleRedireccionar } = require('../controllers/redireccionarController');

const router = express.Router();

router.post('/redireccionar', handleRedireccionar);

module.exports = router;
