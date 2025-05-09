const ticketService = require('../services/solicitudesAtendidasService');

const getMisTickets = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (!usuarioId) {
      return res.status(400).json({ error: 'Usuario ID requerido' });
    }

    const tickets = await ticketService.getTicketsByUserId(usuarioId);
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getMisTickets
};
