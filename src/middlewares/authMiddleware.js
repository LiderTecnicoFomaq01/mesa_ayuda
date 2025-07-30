// src/middlewares/auth.js o src/utils/auth.js (donde lo tengas)
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../../dbConfig');

const JWT_SECRET = process.env.JWT_SECRET;

exports.generarToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol // 👈 este es el dato clave
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const [rows] = await db.query('SELECT token FROM jwt_blacklist WHERE token = ?', [token]);
    if (rows.length > 0) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ success: false, message: 'Error de autenticación' });
  }
};
