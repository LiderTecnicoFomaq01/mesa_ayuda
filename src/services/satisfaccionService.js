const db = require('../../dbConfig');

const guardarEncuesta = async ({ ticket_id, q1, q3 }) => {
  const [result] = await db.query(
    `INSERT INTO encuestas_satisfaccion (ticket_id, q1, q3) VALUES (?, ?, ?)`,
    [ticket_id, q1, q3]
  );
  return result.insertId;
};

module.exports = {
  guardarEncuesta
};
