import jwt from 'jsonwebtoken'

export function isAuthenticated(req, res, next) {
    try {
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];
        
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = userId;
        
        next();
    } catch (error) {
        res.status(401).send({auth: false, message: 'Token inválido.'})
    }
}
