const ticketsService = require('../services/ticketsService');

exports.createTicket = async (req, res) => {
  try {
    // Parsear datos del ticket
    const ticketData = JSON.parse(req.body.ticket);
    
    // Obtener archivos (ya no necesitamos fileInfo)
    const files = req.files ? Object.values(req.files) : [];

    // Procesar ticket
    const result = await ticketsService.processTicketCreation({
      ticketData,
      files
    });

    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      ticketId: result.ticketId,
      filesCount: files.length
    });
  } catch (error) {
    console.error('Error en createTicket:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear el ticket',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};