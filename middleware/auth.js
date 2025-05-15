const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Verifica si existe el header y si comienza con 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Puedes extraer lo que hayas codificado en el token (id, role, etc.)
        req.user = decoded;

        next(); // continuar al siguiente middleware o ruta
    } catch (err) {
        return res.status(401).json({ msg: 'Token inválido' });
    }
};

module.exports = auth;
