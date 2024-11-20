// authMiddleware.js
const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log("Token recibido:", token); // Verificar si el token está llegando correctamente
    if (!token) {
        return res.status(403).json({error: 'Acceso denegado. Null Token.'});
    }
    // Eliminar el prefijo "Bearer " del token
    const tokenWithoutBearer = token.split(' ')[1];
    if (!tokenWithoutBearer) {
        return res.status(403).json({error: 'Acceso denegado. Token mal formado.'});
    }
    try {
        // Ahora, verificamos el token sin el prefijo "Bearer "
        const decoded = jwt.verify(tokenWithoutBearer, 'example');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
const verifyAdmin = (req, res, next) => {
    if(req.user.role !== 'admin'){
        return res.status(403).json({error: 'Acceso denegado. Se requiere rol de administrador'});
    }
    next();
};
module.exports = {verifyToken, verifyAdmin};