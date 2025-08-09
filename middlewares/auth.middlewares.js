// middleware/auth.js
import jwt from 'jsonwebtoken';
const SECRET = process.env.SECRET;

export function authenticateJWT(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT Error:", err.message);
        return res.status(403).send("Forbidden");
    }
}
