// hash.js
const bcrypt = require('bcrypt');

async function generarHash() {
  const password = 'hola mundo';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
}

generarHash();
