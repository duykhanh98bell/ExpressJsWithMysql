import jwt from "jsonwebtoken";

export const verifyToken = (req,res,next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).json({ message: 'Token not found' });
    try {
        const tokenAuth = token.split(" ")[1];
        const verified = jwt.verify(tokenAuth,process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).send('Invalid Token');
    }
};