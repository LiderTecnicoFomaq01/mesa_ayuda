const db = require('../../dbConfig');
const bcrypt = require('bcryptjs');

exports.autenticarUsuario = async (email, password) => {
    try {
        // 1. Normalizar el email (eliminar espacios y convertir a minúsculas)
        email = email.trim().toLowerCase();
        
        // 2. Buscar usuario
        const [users] = await db.query(`
            SELECT u.id, u.email, u.contraseña, u.activo, u.bloqueado, 
                   u.fecha_desbloqueo, u.intentos_fallidos, r.nombre AS rol,
                   u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
                   u.ultimo_login, u.numero_documento, td.abreviatura AS tipo_documento
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            JOIN tipo_documento td ON u.tipo_documento_id = td.id
            WHERE u.email = ?
        `, [email]);

        // 3. Verificar si el usuario existe
        if (users.length === 0) {
            return { 
                success: false, 
                message: 'Credenciales incorrectas', 
                status: 401 
            };
        }

        const user = users[0];

        // 4. Depuración - Mostrar datos importantes
        console.log('[DEBUG] Contraseña recibida:', `"${password}"`, 'Longitud:', password.length);
        console.log('[DEBUG] Contraseña en BD:', `"${user.contraseña}"`, 'Longitud:', user.contraseña ? user.contraseña.length : 'null');

        // 5. Verificar estado de la cuenta
        if (!user.activo) {
            return {
                success: false,
                message: 'Tu cuenta está inactiva. Por favor contacta al administrador.',
                status: 403,
                userData: {
                    email: user.email,
                    nombre: `${user.primer_nombre} ${user.primer_apellido}`
                }
            };
        }

        // 6. Verificar si la cuenta está bloqueada temporalmente
        if (user.bloqueado && (!user.fecha_desbloqueo || new Date(user.fecha_desbloqueo) > new Date())) {
            const minutosRestantes = Math.ceil((new Date(user.fecha_desbloqueo) - new Date()) / (1000 * 60));
            return {
                success: false,
                message: `Cuenta bloqueada temporalmente. Intenta nuevamente en ${minutosRestantes} minutos.`,
                status: 403,
                unlockTime: user.fecha_desbloqueo
            };
        }

        // 7. Verificar contraseña (comparación directa con normalización)
        const isMatch = password.trim() === (user.contraseña || '').trim();
        console.log('[DEBUG] Resultado comparación:', isMatch);

        if (!isMatch) {
            // Actualizar intentos fallidos
            const newAttempts = user.intentos_fallidos + 1;
            let bloqueado = user.bloqueado;
            let fechaDesbloqueo = user.fecha_desbloqueo;

            if (newAttempts >= 3) {
                bloqueado = true;
                fechaDesbloqueo = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
            }

            await db.query(
                'UPDATE usuarios SET intentos_fallidos = ?, bloqueado = ?, fecha_desbloqueo = ? WHERE id = ?',
                [newAttempts, bloqueado, fechaDesbloqueo, user.id]
            );

            return {
                success: false,
                message: newAttempts >= 3 
                    ? 'Demasiados intentos fallidos. Cuenta bloqueada por 30 minutos.' 
                    : 'Credenciales incorrectas. Intentos restantes: ' + (3 - newAttempts),
                status: 401,
                attemptsLeft: 3 - newAttempts
            };
        }

        // 8. Resetear intentos y actualizar último login si el login es exitoso
        await db.query(`
            UPDATE usuarios 
            SET 
                intentos_fallidos = 0, 
                bloqueado = FALSE, 
                fecha_desbloqueo = NULL,
                ultimo_login = NOW()
            WHERE id = ?
        `, [user.id]);

        // 9. Preparar datos de usuario para el token
        return { 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                rol: user.rol,
                nombre: `${user.primer_nombre} ${user.primer_apellido}`,
                ultimo_login: new Date() // También puedes devolver la fecha actual
            }
        };
    } catch (error) {
        console.error('Error en authService:', {
            message: error.message,
            stack: error.stack,
            sqlError: error.sqlMessage
        });
        throw error;
    }
};