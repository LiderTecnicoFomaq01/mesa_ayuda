const ticketsService = require('../services/ticketsService');

exports.createTicket = async (req, res) => {
  try {
    // 1. Parsear datos del ticket
    const ticketData = JSON.parse(req.body.ticket);

    // 2. Leer archivos subidos
    const files = req.files ? Object.values(req.files) : [];

    // 3. Leer la info de cada archivo: puede venir en req.body['archivos_info[]']
    let rawInfos = req.body['archivos_info[]'] || [];
    if (!Array.isArray(rawInfos)) {
      rawInfos = [rawInfos];
    }
    const fileInfos = rawInfos.map(infoStr => JSON.parse(infoStr));
    // Ahora fileInfos es un array de { id_campo, nombre_original } en el mismo orden que files

    // 4. Llamar al servicio pasándole ambos arrays
    const result = await ticketsService.processTicketCreation({
      ticketData,
      files,
      fileInfos
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
