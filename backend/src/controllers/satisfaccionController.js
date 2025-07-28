const satisfaccionService = require('../services/satisfaccionService');

exports.guardarEncuesta = async (req, res) => {
  try {
    const { ticket_id, q1, q3 } = req.body;

    if (!ticket_id || !q1 || !q3) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const id = await satisfaccionService.guardarEncuesta({ ticket_id, q1, q3 });
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error al guardar encuesta:', error);
    res.status(500).json({ error: 'Error al guardar la encuesta' });
  }
};
