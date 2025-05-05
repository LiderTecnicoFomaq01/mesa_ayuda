const ticketsService = require('../services/ticketsService');

exports.createTicket = async (req, res) => {
    try {
        // Debug inicial
        console.log('Archivos recibidos:', req.files);
        console.log('Campos recibidos:', req.body);

        if (!req.body.ticket) {
            throw new Error('El campo "ticket" es requerido');
        }

        const ticketData = JSON.parse(req.body.ticket);
        const files = req.files || []; // Multer coloca los archivos aquí

        // Procesar fileInfo (adaptado para múltiples archivos)
        const filesMeta = files.map((file, index) => ({
            id_campo: req.body[`fileInfo_${index}`]?.id_campo,
            originalName: file.originalname
        }));

        const result = await ticketsService.processTicketCreation({
            ticketData,
            files,
            fileInfo: filesMeta // Enviamos metadatos estructurados
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error detallado:', error.stack);
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};