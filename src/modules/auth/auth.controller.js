// const conn = require("../connectDb/connection");
import conn from "../../connectDb/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authValidation,loginValidation,editUserValidation } from "./auth.validate.js";
import _ from 'lodash';
import { pagination } from '../adapter/pagination.js';
import { generate } from 'rand-token';

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
        let sql = 'SELECT * FROM users';
        const [countRecords] = await conn.query(sql);
        const responseHeader = await pagination(req.query,countRecords.length);
        if(responseHeader?.page) {
            sql += ` limit ${responseHeader.perPage} offset ${(responseHeader.page - 1) * responseHeader.perPage}`;
        }
        const [rows] = await conn.query(sql);
        return res.status(200).json({ rows,responseHeader });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const findOne = async (req,res) => {
    try {
        const callFind = await checkUser(req.params.id);
        return res.status(200).json({ user: callFind[0] });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const verifyNumberId = (id) => {
    const regexTest = new RegExp(/^[0-9]*$/);
    if(!regexTest.test(Number(id))) throw new Error('Id must be number');
    return true;
}

export const checkUser = async (id) => {
    try {
        verifyNumberId(id);
        const sql = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await conn.query(sql,id);
        if(_.isEmpty(rows)) throw new Error('User not found!');
        return rows;
    } catch(error) {
        throw new Error(error.message);
    }
}

export const createNewUser = async (req,res) => {
    try {
        const { error } = authValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });
        const info = req.body;
        const usernameToLower = info.username.toLowerCase();

        const selectUser = "SELECT * FROM users WHERE username = ?";
        const [rows] = await conn.query(selectUser,usernameToLower);
        if(!_.isEmpty(rows)) return res.status(400).json({ message: 'username must be unique' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(info.password,salt);
        const payload = {
            firstname: info.firstname,
            lastname: info.lastname,
            username: usernameToLower,
            pass: hashedPassword,
            email: info?.email,
            years_old:
                info?.years_old
        }
        const sqlInsert = "INSERT INTO users SET ?";
        await conn.query(sqlInsert,payload);
        return res.status(201).json({ message: 'Added successfully!' })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const editUser = async (req,res) => {
    try {
        await checkUser(req.params.id);

        const { error } = editUserValidation(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        if(req.body?.years_old && Number(req.body.years_old || 0) < 16) return res.status(400).json({ message: 'years old' })

        const str = Object.keys(req.body).map(key => key + "=" + `'${req.body[key]}'`).join(", ");
        const updateOne = `UPDATE users SET ${str} WHERE id=?`;
        await conn.query(updateOne,req.params.id);

        return res.status(201).json({
            message: 'Updated',
        })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const deleteUser = async (req,res) => {
    try {
        await checkUser(req.params.id);

        const deleteOne = "DELETE FROM users WHERE id=?";
        await conn.query(deleteOne,[req.params.id]);
        return res.status(201).json({
            message: 'Deleted!',
        })
    } catch(error) {
        return res.json({ message: error.message });
    }
}
