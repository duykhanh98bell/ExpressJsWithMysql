// const conn = require("../connectDb/connection");
import * as conn from "../../connectDb/connection.js";
import { authValidation,loginValidation,editUserValidation } from "./auth.validate.js";
import authService from './auth.service.js';

const login = async (req,res) => {
    try {
        const { error } = loginValidation(req.body);
        if(error) return res.sendError({ message: error.details[0].message,code: error.code });

        const result = await authService.login(req.body)

        return res.header('auth-token',result.token).json({
            message: "Login successfully!",
            accessToken: result.token,
            refreshToken: result.refreshToken
        });
    } catch(error) {
        res.sendError({ message: error.message || 'login failed',code: error.code });
    }
}

// async function logout(req, res) {
//     try {

//     } catch (error) {

//     }
// }

async function refreshToken(req,res) {
    try {
        if(!req.body.refreshToken) res.sendError({ message: 'refreshToken is required!' });
        const token = await authService.refreshToken(req.body.refreshToken);
        res.sendJson({ rows: token })
    } catch(error) {
        res.sendError({ code: error.code,message: error.message })
    }
}

const register = (req,res) => {
    const sql = 'SELECT * FROM users';
    conn.query(sql,(err,result) => {
        if(err) throw err;
        res.json({ register: result })
    })
};

const getAllUsers = async (req,res) => {
    try {
        const rows = await authService.getAllUsers(req.query);
        res.sendJson(rows)
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

const findOne = async (req,res) => {
    try {
        const callFind = await authService.findUser(req.params.id);
        res.sendJson({ rows: callFind });
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

const createNewUser = async (req,res) => {
    try {
        const { error } = authValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });
        await authService.createNewUser(req.body);
        res.sendJson({ message: 'Added successfully!' })
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

const editUser = async (req,res) => {
    try {
        const { error } = editUserValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });
        await authService.updateUser(req.params.id,req.body);
        res.sendJson({
            message: 'Updated',
        })
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

const deleteUser = async (req,res) => {
    try {
        await authService.deleteUser(req.params.id);
        res.sendJson({
            message: 'Deleted!',
        })
    } catch(error) {
        res.sendError({ message: error.message,code: error.code });
    }
}

export default { login,refreshToken,register,getAllUsers,findOne,createNewUser,editUser,deleteUser }
