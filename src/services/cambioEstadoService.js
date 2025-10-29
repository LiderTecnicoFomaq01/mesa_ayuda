const db = require('../../dbConfig');
const { enviarCorreo } = require('./emailService');

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
            `SELECT id_estado, fecha_creacion, hora_solucion, contador_horas, fecha_inicio_en_curso FROM tickets WHERE id = ?`,
            [radicado]
        );

        if (rows.length === 0) throw new Error('No se encontró el ticket');

        const ticket = rows[0];
        const estadoAnterior = ticket.id_estado;
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
        if (Number(nuevoEstado) === 1) {
            console.log('[IF] Estado 1 detectado: Reapertura de ticket');

            if (ticket.hora_solucion) {
                console.log('Ticket tenía hora de solución. Reiniciando...');
                await db.query(
                    `UPDATE tickets
                     SET id_estado = ?, fecha_actualizacion = NOW(), hora_solucion = NULL,
                         fecha_inicio_en_curso = NOW(), contador_horas = 0
                     WHERE id = ?`,
                    [nuevoEstado, radicado]
                );
            } else {
                console.log('Ticket no tenía hora de solución. Solo se actualiza el estado.');
                await db.query(
                    `UPDATE tickets
                     SET id_estado = ?, fecha_actualizacion = NOW(),
                         fecha_inicio_en_curso = NOW(), contador_horas = 0,
                         hora_solucion = NULL
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

            const fechaInicio = ticket.fecha_inicio_en_curso
                ? new Date(ticket.fecha_inicio_en_curso)
                : ticket.hora_solucion
                    ? new Date(ticket.hora_solucion)
                    : new Date(ticket.fecha_creacion);

            const horasNuevas = calcularHorasHabiles(fechaInicio, ahora);
            const totalHoras = horasNuevas;

            console.log(`Calculando horas hábiles desde: ${fechaInicio}`);
            console.log(`Horas nuevas calculadas: ${horasNuevas}`);
            console.log(`Total acumulado de horas: ${totalHoras}`);

            await db.query(
                `UPDATE tickets
                 SET id_estado = ?, fecha_actualizacion = NOW(),
                     contador_horas = ?, hora_solucion = NOW(),
                     fecha_inicio_en_curso = NULL
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

        try {
            const [userRows] = await db.query(
                `SELECT u.email, u.primer_nombre, u.primer_apellido
                 FROM usuarios u
                 JOIN tickets t ON t.id_usuario = u.id
                 WHERE t.id = ?`,
                [radicado]
            );

            const [estadoRows] = await db.query(
                'SELECT nombre_estado FROM estados_ticket WHERE id = ?',
                [nuevoEstado]
            );

            const shouldNotify =
                [3, 4].includes(Number(nuevoEstado)) ||
                (Number(nuevoEstado) === 1 && Number(estadoAnterior) === 2);

            if (userRows.length && estadoRows.length && shouldNotify) {
                const { email, primer_nombre } = userRows[0];
                const { nombre_estado } = estadoRows[0];

                enviarCorreo({
                    to: email,
                    subject: `Actualización de su ticket #${radicado}`,
                    text: `Hola ${primer_nombre},\n\nEl estado de su ticket ${radicado} ha cambiado a \"${nombre_estado}\".`,
                    html: `<p>Hola ${primer_nombre},</p><p>El estado de su ticket <strong>${radicado}</strong> ha cambiado a <strong>${nombre_estado}</strong>.</p>`
                })
                .then(() => {
                    console.log('📧 Notificación enviada a', email);
                })
                .catch(notifyErr => {
                    console.error('Error al enviar correo de notificación:', notifyErr);
                });
            }
        } catch (notifyErr) {
            console.error('Error al enviar correo de notificación:', notifyErr);
        }

        return true;
    } catch (err) {
        console.error('❌ Error al cambiar el estado:', err);
        return false;
    }
};

module.exports = {
    cambiarEstado,
};
