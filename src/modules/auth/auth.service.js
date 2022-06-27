import authRepository from './auth.repository.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';

const getAllUsers = async (query) => {
    return await authRepository.findPagination(query);
}

const findUser = async (id) => {
    const user = await authRepository.findById(id);
    if(!user) throw new Error('User not found!');
    return user;
}

const createNewUser = async (info) => {
    const usernameToLower = info.username.toLowerCase();
    const user = await authRepository.findOne({ username: usernameToLower });
    if(user) throw new Error('username must be unique');

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
        throw new Error('years old')
    return await authRepository.updateOne(id,payload);
}

const deleteUser = async (id) => {
    return await authRepository.deleteById(id);
}

export default { getAllUsers,findUser,createNewUser,updateUser,deleteUser };