const authService = require('../services/authService');
const { generarToken } = require('../middlewares/authMiddleware');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validación básica
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const result = await authService.autenticarUsuario(email, password);
        
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