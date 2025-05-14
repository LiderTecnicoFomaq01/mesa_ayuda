const db = require('../../dbConfig');

/**
 * Calcula horas hábiles entre dos fechas (lunes a viernes, 8-12 y 13-17).
 */
function calcularHorasHabiles(fechaInicio, fechaFin) {
  const MILISEGUNDOS_POR_HORA = 1000 * 60 * 60;
  let totalMilisegundos = 0;

  let actual = new Date(fechaInicio);

  while (actual < fechaFin) {
      const dia = actual.getDay();
      const hora = actual.getHours();

      // Solo de lunes a viernes
      if (dia >= 1 && dia <= 5) {
          let bloques = [
              { inicio: 8, fin: 12 },
              { inicio: 13, fin: 17 }
          ];

          bloques.forEach(b => {
              let inicioBloque = new Date(actual);
              inicioBloque.setHours(b.inicio, 0, 0, 0);

              let finBloque = new Date(actual);
              finBloque.setHours(b.fin, 0, 0, 0);

              // Ajusta los límites al rango real
              let inicioValido = new Date(Math.max(inicioBloque, fechaInicio));
              let finValido = new Date(Math.min(finBloque, fechaFin));

              if (inicioValido < finValido) {
                  totalMilisegundos += finValido - inicioValido;
              }
          });
      }

      // Avanza al siguiente día
      actual.setDate(actual.getDate() + 1);
      actual.setHours(0, 0, 0, 0);
  }

  const totalHoras = totalMilisegundos / MILISEGUNDOS_POR_HORA;
  return Math.round(totalHoras);
}

const cambiarEstado = async (radicado, nuevoEstado) => {
    try {
        const [rows] = await db.query(
            `SELECT fecha_creacion, hora_solucion, contador_horas FROM tickets WHERE id = ?`,
            [radicado]
        );

        if (rows.length === 0) throw new Error('No se encontró el ticket');

        const ticket = rows[0];
        const ahora = new Date();

        console.log('======= CAMBIO DE ESTADO =======');
        console.log(`Radicado: ${radicado}`);
        console.log(`Nuevo estado recibido: ${nuevoEstado}`);
        console.log(`Estado actual:`);
        console.log(` - Fecha creación: ${ticket.fecha_creacion}`);
        console.log(` - Hora de solución: ${ticket.hora_solucion}`);
        console.log(` - Contador de horas: ${ticket.contador_horas}`);
        console.log('================================');

        // Si el ticket se reabre
        if (nuevoEstado === 1) {
            console.log('[IF] Estado 1 detectado: Reapertura de ticket');

            if (ticket.hora_solucion) {
                console.log('Ticket tenía hora de solución. Reiniciando...');
                await db.query(
                    `UPDATE tickets 
                     SET id_estado = ?, fecha_actualizacion = NOW(), hora_solucion = NULL 
                     WHERE id = ?`,
                    [nuevoEstado, radicado]
                );
            } else {
                console.log('Ticket no tenía hora de solución. Solo se actualiza el estado.');
                await db.query(
                    `UPDATE tickets 
                     SET id_estado = ?, fecha_actualizacion = NOW() 
                     WHERE id = ?`,
                    [nuevoEstado, radicado]
                );
            }
        }

        // Si el ticket se cierra
        else if ([3, 4, 5].includes(Number(nuevoEstado))){
            console.log('[ELSE IF] Estado de cierre detectado (3, 4 o 5)');

            // Si no tenía hora de solución
            if (!ticket.hora_solucion) {
                console.log('No tenía hora de solución. Asignando hora actual:', ahora);
                await db.query(
                    `UPDATE tickets 
                     SET hora_solucion = NOW() 
                     WHERE id = ?`,
                    [radicado]
                );
            } else {
                console.log('Ya tenía hora de solución:', ticket.hora_solucion);
            }

            const fechaInicio = ticket.hora_solucion
                ? new Date(ticket.hora_solucion)
                : new Date(ticket.fecha_creacion);

            const horasNuevas = calcularHorasHabiles(fechaInicio, ahora);
            const totalHoras = ticket.contador_horas + horasNuevas;

            console.log(`Calculando horas hábiles desde: ${fechaInicio}`);
            console.log(`Horas nuevas calculadas: ${horasNuevas}`);
            console.log(`Total acumulado de horas: ${totalHoras}`);

            await db.query(
                `UPDATE tickets 
                 SET id_estado = ?, fecha_actualizacion = NOW(), 
                     contador_horas = ?, hora_solucion = NOW() 
                 WHERE id = ?`,
                [nuevoEstado, totalHoras, radicado]
            );

            console.log('Ticket actualizado con cierre.');
        }

        // Otros cambios de estado
        else {
            console.log('[ELSE] Cambio de estado normal. Sin afectar hora_solucion ni contador_horas');
            await db.query(
                `UPDATE tickets 
                 SET id_estado = ?, fecha_actualizacion = NOW() 
                 WHERE id = ?`,
                [nuevoEstado, radicado]
            );
        }

        console.log('✅ Cambio de estado completado.');
        return true;
    } catch (err) {
        console.error('❌ Error al cambiar el estado:', err);
        return false;
    }
};

module.exports = {
    cambiarEstado,
};
