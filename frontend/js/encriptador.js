// hash.js
const bcrypt = require('bcrypt');

async function generarHash() {
  const password = 'bermudez19971127';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
}

generarHash();
