import { escape } from 'mysql2';
import conn from "../../connectDb/connection.js";
import { pagination } from '../adapter/pagination.js';

const find = async () => {
    const [statements] = await conn.query(`SELECT * FROM statements WHERE is_deleted=0`);
    return statements
}

const findPagination = async (query) => {
    let sql = 'SELECT * FROM statements WHERE is_deleted=0';
    const [countRecords] = await conn.query(sql);
    const responseHeader = await pagination(query,countRecords.length);
    if(responseHeader?.page) {
        sql += ` limit ${escape(responseHeader.perPage)} offset ${escape((responseHeader.page - 1) * responseHeader.perPage)}`;
    }
    const [rows] = await conn.query(sql);
    return { rows,responseHeader }
}

const findById = async (id) => {
    const sql = 'SELECT * FROM statements WHERE id = ? AND is_deleted=0';
    const [rows] = await conn.query(sql,[id]);
    return rows[0];
}

const findOne = async (obj) => {
    const strKey = Object.keys(obj).map(key => key + "=?").join("AND ");
    const arrValue = [];
    Object.keys(obj).map(key => arrValue.push(obj[key]))
    const sql = `SELECT * FROM statements WHERE is_deleted=0 AND ${strKey}`;
    const [rows] = await conn.query(sql,arrValue);
    return rows[0];
}

const create = async (payload) => {
    const sqlInsert = "INSERT INTO statements SET ?";
    return await conn.query(sqlInsert,payload);
}

const updateOne = async (id,payload) => {
    const str = Object.keys(payload).map(key => key + "=?").join(", ");
    const arrValue = [];
    Object.keys(payload).map(key => arrValue.push(payload[key]))
    const updateOne = `UPDATE statements SET ${str} WHERE id=?`;
    arrValue.push(id);
    return await conn.query(updateOne,arrValue);
}

const deleteById = async (id) => {
    const deleteSql = `UPDATE statements SET is_deleted=? WHERE id=?`;
    return await conn.query(deleteSql,[true,id]);
}

const deleteOne = async (obj) => {
    const strKey = Object.keys(obj).map(key => key + "=?").join("AND ");
    const arrValue = [];
    Object.keys(obj).map(key => arrValue.push(obj[key]))
    const sql = `UPDATE statements SET is_deleted=true WHERE ${strKey}`;
    await conn.query(sql,arrValue);
}

export default {
    find,
    findPagination,
    findById,
    findOne,
    create,
    updateOne,
    deleteById,
    deleteOne
}