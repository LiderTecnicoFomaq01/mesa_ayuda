const ticketsService = require('../services/ticketsService');

exports.createTicket = async (req, res) => {
    try {
        const { id_categoria, id_usuario, id_estado } = req.body;
        
        // Validación básica
        if (!id_categoria || !id_usuario || !id_estado) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const ticketId = await ticketsService.createTicket({
            id_categoria,
            id_usuario,
            id_estado
        });

        res.status(201).json({ 
            message: 'Ticket creado exitosamente',
            ticketId 
        });

    } catch (error) {
        console.error('Error al crear ticket:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};