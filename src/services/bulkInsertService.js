const fs = require('fs');
const readline = require('readline');
const pool = require('../../dbConfig');

/**
 * Importa un archivo de texto plano delimitado e inserta los registros
 * en la base de datos utilizando inserciones por lotes. Esta estrategia
 * reduce el tiempo de procesamiento para grandes volúmenes de datos.
 *
 * @param {Object} options
 * @param {string} options.filePath   Ruta absoluta del archivo a procesar.
 * @param {string} options.table      Nombre de la tabla destino.
 * @param {string[]} options.columns  Columnas de la tabla en el mismo orden
 *                                    que aparecen en el archivo.
 * @param {string} [options.separator=',']  Separador de campos.
 * @param {number} [options.batchSize=1000] Cantidad de registros por inserción.
 */
async function importPlainText({
  filePath,
  table,
  columns,
  separator = ',',
  batchSize = 1000
}) {
  const conn = await pool.getConnection();
  const insertSQL = `INSERT INTO ${table} (${columns.join(',')}) VALUES ?`;

  try {
    await conn.beginTransaction();
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    let batch = [];
    for await (const line of rl) {
      if (!line.trim()) continue;
      const values = line.split(separator).map(v => v.trim());
      batch.push(values);
      if (batch.length === batchSize) {
        await conn.query(insertSQL, [batch]);
        batch = [];
      }
    }

    if (batch.length) {
      await conn.query(insertSQL, [batch]);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { importPlainText };
