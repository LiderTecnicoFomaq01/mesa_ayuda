const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // lógica para guardar el ticket
  res.json({ mensaje: 'Ticket recibido' });
});

module.exports = router;
