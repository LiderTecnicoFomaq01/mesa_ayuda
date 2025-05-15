const respuestaService = require('../services/respuestaService');

exports.crearRespuesta = async (req, res) => {
  try {
    const { id_ticket, id_usuario, mensaje, interno } = req.body;
    const files = req.files || [];

    // Convertir a booleano si viene como string
    const esInterno = interno === 'true' || interno === true;

    const resultado = await respuestaService.guardarRespuesta({
      id_ticket,
      id_usuario,
      mensaje,
      files,
      interno: esInterno
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al guardar la respuesta:', error);
    res.status(500).json({ error: 'Error al guardar la respuesta' });
  }
};
