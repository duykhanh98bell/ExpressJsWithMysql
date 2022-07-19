import jwt from "jsonwebtoken";
import redis from '../../connection/redisConfig.js'

export const verifyToken = (req,res,next) => {
    const token = req.header('Authorization');
    const accessToken = redis.get('accessToken');
    if(!token) return res.sendError({ message: 'accessToken is required',code: '401' });
    try {
        const tokenAuth = token.split(" ")[1];
        const verified = jwt.verify(tokenAuth,process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch(err) {
        res.sendError({ code: err.code,message: err.message })
    }
};