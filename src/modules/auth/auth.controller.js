// const conn = require("../connectDb/connection");
import conn from "../../connectDb/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authValidation,loginValidation,editUserValidation } from "./auth.validate.js";
import _ from 'lodash';

export const login = async (req,res) => {
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    const info = req.body;
    const usernameToLower = info.username.toLowerCase();

    const selectUser = `SELECT * FROM users WHERE username = '${usernameToLower}'`;
    const [rows] = await conn.query(selectUser);
    if(_.isEmpty(rows)) res.status(400).send('User is undefined');

    const validPass = await bcrypt.compare(info.password,rows.password);
    if(!validPass) return res.status(400).send('Password is wrong!!!');

    const token = jwt.sign({ _id: rows.id },process.env.TOKEN_SECRET);
    return res.header('auth-token',token).send(token);
}

export const register = (req,res) => {
    const sql = 'SELECT * FROM users';
    conn.query(sql,(err,result) => {
        if(err) throw err;
        res.json({ register: result })
    })
};

export const getAllUsers = async (req,res) => {
    const sql = 'SELECT * FROM users';
    const [rows] = await conn.query(sql);
    return res.status(200).json({ rows })
}

export const findOne = async (req,res) => {
    try {
        const callFind = await checkUser(req.params.id);
        return res.status(200).json({ user: callFind });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const checkUser = async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await conn.query(sql,id);
    if(_.isEmpty(rows)) throw new Error('User not found!');
    return rows;
}

export const createNewUser = async (req,res) => {
    try {
        const { error } = authValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        const info = req.body;
        const usernameToLower = info.username.toLowerCase();

        const selectUser = "SELECT * FROM users WHERE username = ?";
        const [rows] = await conn.query(selectUser,usernameToLower);
        if(!_.isEmpty(rows)) return res.status(400).send('username must be unique');

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
        return res.send('Added successfully!')
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const editUser = async (req,res) => {
    try {
        await checkUser(req.params.id);

        const { error } = editUserValidation(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        const { firstname,lastname,password,email,years_old } = req.body;
        if(Number(years_old || 0) < 16) return res.status(400).json({ message: 'years old' })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const updateOne = "UPDATE users SET firstname=?, lastname=?, pass=?, email=?, years_old=? WHERE id=?";
        await conn.query(updateOne,[firstname,lastname,hashedPassword,email,years_old,req.params.id]);

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

// module.exports = { login,register,getAllUsers,findOne,createNewUser,editUser,deleteUser,checkUser };