const detalleTicketService = require('../services/detalle-ticket');

exports.getTicketDetails = async (req, res) => {
    const ticketId = req.params.id;

    try {
        const ticketDetails = await detalleTicketService.getFullTicketDetails(ticketId);
        res.json(ticketDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los detalles del ticket' });
    }
};
