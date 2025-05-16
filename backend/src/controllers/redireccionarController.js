const { redireccionarTicket } = require('../services/redireccionarService');

async function handleRedireccionar(req, res) {
  const { ticketId, usuarioId, categoriaId } = req.body;

  if (!ticketId || !usuarioId || !categoriaId) {
    return res.status(400).json({ error: 'Faltan campos requeridos: ticketId, usuarioId o categoriaId.' });
  }

  try {
    await redireccionarTicket(ticketId, usuarioId, categoriaId);
    res.json({ message: 'Ticket redireccionado con éxito.' });
  } catch (error) {
    console.error('Error en redireccionar:', error);
    res.status(500).json({ error: 'Error interno al redireccionar ticket.' });
  }
}

module.exports = { handleRedireccionar };
