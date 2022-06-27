// const conn = require("../connectDb/connection");
import conn from "../../connectDb/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authValidation,loginValidation,editUserValidation } from "./auth.validate.js";
import _ from 'lodash';
import { generate } from 'rand-token';
import authService from './auth.service.js';

export const login = async (req,res) => {
    try {
        const { error } = loginValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });
        const info = req.body;
        const usernameToLower = info.username.toLowerCase();

        const selectUser = `SELECT * FROM users WHERE username = '${usernameToLower}'`;
        const [rows] = await conn.query(selectUser);
        if(_.isEmpty(rows)) res.status(400).send('User is undefined');

        const validPass = await bcrypt.compare(info.password,rows[0].pass);
        if(!validPass) return res.status(400).send('Password is wrong!!!');

        const token = jwt.sign(
            {
                id: rows[0].id,
                username: rows[0].username,
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: process.env.TOKEN_LIFE
            }
        );

        let refreshToken = generate(16);
        if(!rows[0].refreshToken) {
            await conn.query(`update users set refreshToken=? where id=?`,[refreshToken,rows[0].id]);
        } else {
            refreshToken = rows[0].refreshToken;
        }
        return res.header('auth-token',token).json({
            message: "Login successfully!",
            accessToken: token,
            refreshToken
        });
    } catch(error) {
        return res.json({ message: 'Login failed!' });
    }
}

export const register = (req,res) => {
    const sql = 'SELECT * FROM users';
    conn.query(sql,(err,result) => {
        if(err) throw err;
        res.json({ register: result })
    })
};

export const getAllUsers = async (req,res) => {
    try {
        const rows = await authService.getAllUsers(req.query);
        return res.status(201).json(rows)
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const findOne = async (req,res) => {
    try {
        const callFind = await authService.findUser(req.params.id);
        return res.status(200).json({ user: callFind });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const createNewUser = async (req,res) => {
    try {
        const { error } = authValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });
        await authService.createNewUser(req.body);
        return res.status(201).json({ message: 'Added successfully!' })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const editUser = async (req,res) => {
    try {
        const { error } = editUserValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });
        await authService.updateUser(req.params.id,req.body);


        return res.status(201).json({
            message: 'Updated',
        })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const deleteUser = async (req,res) => {
    try {
        await authService.deleteUser(req.params.id);
        return res.status(201).json({
            message: 'Deleted!',
        })
    } catch(error) {
        return res.json({ message: error.message });
    }
}
