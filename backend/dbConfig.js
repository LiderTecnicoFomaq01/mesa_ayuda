// dbConfig.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool(process.env.JAWSDB_URL);

// Test de conexión
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión a JawsDB MySQL exitosa');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a JawsDB MySQL:', err);
  });

module.exports = pool;
