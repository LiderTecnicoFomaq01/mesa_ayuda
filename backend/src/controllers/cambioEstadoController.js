const cambioEstadoService = require('../services/cambioEstadoService');
console.log('[DEBUG] req.user:', require.user);

const cambiarEstado = async (req, res) => {
  const { radicado, estado } = req.body;
  const userRole = req.user?.rol;
  const permittedRoles = ['admin', 'usuario administrativo'];

  if (!radicado || !estado) {
    return res.status(400).json({ mensaje: 'Radicado y estado son requeridos' });
  }

  if (!permittedRoles.includes(userRole)) {
    return res.status(403).json({ mensaje: 'No autorizado para cambiar estados' });
  }

  if (Number(estado) === 5 && userRole !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo los administradores pueden cancelar tickets' });
  }

  try {
    // Llamamos al servicio para actualizar el estado del ticket
    const resultado = await cambioEstadoService.cambiarEstado(radicado, estado);

    if (resultado) {
      return res.status(200).json({
        ok: true, // ✅ Esto es lo que espera el frontend
        mensaje: 'Estado del ticket actualizado correctamente'
      });
    } else {
      return res.status(500).json({
        ok: false, // ⚠️ También útil para el frontend
        mensaje: 'Error al cambiar el estado'
      });
    }

  } catch (error) {
    console.error('Error al cambiar el estado:', error);
    return res.status(500).json({ mensaje: 'Error al cambiar el estado' });
  }
};

module.exports = {
  cambiarEstado,
};
