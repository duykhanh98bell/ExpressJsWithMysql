import authRepository from './auth.repository.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import AppError from '../../shared/error.js';
// import _ from 'lodash';
// import { generate } from 'rand-token';
import jwt from "jsonwebtoken";

async function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: process.env.TOKEN_LIFE
        }
    );
}

async function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_LIFE
        }
    );
}

async function login(info) {
    const usernameToLower = info.username.toLowerCase();
    const isUser = await authRepository.findOne({ username: usernameToLower },{ id: 1,username: 1,pass: 1,refreshToken: 1 });
    if(!isUser) throw new AppError({ message: 'username or password is wrong!' });
    const validPass = await bcrypt.compare(info.password,isUser.pass)
    if(!validPass) throw new AppError({ message: 'username or password is wrong!' });

    const token = await generateAccessToken(isUser);
    let refreshToken = await generateRefreshToken(isUser);
    await authRepository.updateOne(isUser.id,{ refreshToken });

    return { token,refreshToken }
}

async function logout(tokenObj) {
    return tokenObj
}

async function refreshToken(refreshToken) {
    const isUser = await authRepository.findOne({ refreshToken },{ refreshToken: 1,username: 1,id: 1 });
    if(!isUser) throw new AppError({ message: 'refreshToken not found!',code: '401' })
    let verified;
    try {
        verified = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    } catch(error) {
        throw new AppError({ message: error.message,code: error.code });
    }
    if(verified.username !== isUser.username) throw new AppError({ code: '403' })

    const newAccessToken = await generateAccessToken(isUser);
    return newAccessToken


}

const getAllUsers = async (query) => {
    return await authRepository.findPagination(query);
}

const findUser = async (id) => {
    const user = await authRepository.findById(id)
    if(!user) throw new AppError({ message: 'User not found!' });
    return user;
}

const createNewUser = async (info) => {
    const usernameToLower = info.username.toLowerCase();
    const user = await authRepository.findOne({ username: usernameToLower });
    if(user) throw new AppError({ message: 'username must be unique' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(info.password,salt);
    const payload = {
        id: uuidv4(),
        firstname: info.firstname,
        lastname: info.lastname,
        username: usernameToLower,
        pass: hashedPassword,
        email: info?.email,
        years_old:
            info?.years_old
    }

    return await authRepository.create(payload);
}

const updateUser = async (id,payload) => {
    if(payload?.years_old && Number(payload.years_old || 0) < 16)
        throw new AppError({ message: 'years old' })
    return await authRepository.updateOne(id,payload);
}

const deleteUser = async (id) => {
    return await authRepository.deleteById(id);
}

export default {
    getAllUsers,
    findUser,
    createNewUser,
    updateUser,
    deleteUser,login,logout,refreshToken
};