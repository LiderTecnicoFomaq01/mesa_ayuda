const authService = require('../services/authService');
const { generarToken } = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validación básica
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        const result = await authService.autenticarUsuario(username, password);
        
        if (!result.success) {
            return res.status(result.status || 401).json({
                success: false,
                message: result.message,
                // Datos adicionales para el frontend
                ...(result.userData && { userData: result.userData }),
                ...(result.unlockTime && { unlockTime: result.unlockTime }),
                ...(result.attemptsLeft && { attemptsLeft: result.attemptsLeft })
            });
        }

        const token = generarToken(result.user);
        
        res.json({
            success: true,
            message: 'Autenticación exitosa',
            token,
            user: result.user
        });
    } catch (error) {
        console.error('Error en authController:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor. Por favor intente más tarde.' 
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const {
            newPassword,
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            email,
            celular
        } = req.body;
        const userId = req.user.id;

        if (!primer_nombre || !primer_apellido || !email || !celular || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        await authService.actualizarDatosIniciales(userId, {
            newPassword,
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            email,
            celular
        });
        res.json({ success: true, message: 'Datos actualizados correctamente' });
    } catch (error) {
        console.error('Error en changePassword:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar los datos' });
    }
};

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token requerido' });
        }

        const decoded = jwt.decode(token);
        const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;

        await authService.logout(token, expiresAt);
        res.json({ success: true, message: 'Sesión cerrada' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
};