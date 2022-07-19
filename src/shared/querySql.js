import { escape } from 'mysql2';
import conn from "../connection/connection.js";
import { pagination } from '../modules/adapter/pagination.js';

function returnFieldsF(fields) {
    return fields ? Object.keys(fields).map(key => fields[key] && `${key}`).join(", ") : ' * ';
}

function returnQueryString(query) {
    const queryStr = Object.keys(query).map(key => key + "=?").join("AND ");
    const arrValue = [];
    Object.keys(query).map(key => arrValue.push(query[key]))
    return { queryStr,arrValue }
}

export const findTable = async (query,fields,table) => {
    const returnFields = returnFieldsF(fields);
    const { queryStr,arrValue } = returnQueryString(query)
    const sql = `SELECT ${returnFields} FROM ${table} WHERE is_deleted=0 AND ${queryStr}`;
    const [users] = await conn.query(sql,arrValue);
    return users
}

export const findPaginationTable = async (query,fields,table) => {
    const returnFields = returnFieldsF(fields);
    let sql = `SELECT ${returnFields} FROM ${table} WHERE is_deleted=0`;
    const [countRecords] = await conn.query(sql);
    const responseHeader = await pagination(query,countRecords.length);
    if(responseHeader?.page) {
        sql += ` limit ${escape(responseHeader.perPage)} offset ${escape((responseHeader.page - 1) * responseHeader.perPage)}`;
    }
    const [rows] = await conn.query(sql);
    return { rows,responseHeader }
}

export const findByIdTable = async (id,fields,table) => {
    const returnFields = returnFieldsF(fields);
    const sql = `SELECT ${returnFields} FROM ${table} WHERE id = ? AND is_deleted=0`;
    const [rows] = await conn.query(sql,[id]);
    return rows[0];
}

export const findOneTable = async (query,fields,table) => {
    const returnFields = returnFieldsF(fields);
    const { queryStr,arrValue } = returnQueryString(query)
    const sql = `SELECT ${returnFields} FROM ${table} WHERE is_deleted=0 AND ${queryStr}`;
    const [rows] = await conn.query(sql,arrValue);
    return rows[0];
}

export const createTable = async (payload,table) => {
    const sqlInsert = `INSERT INTO ${table} SET ?`;
    return await conn.query(sqlInsert,payload);
}

export const updateOneByIdTable = async (id,payload,table) => {
    const str = Object.keys(payload).map(key => key + "=?").join(", ");
    const arrValue = [];
    Object.keys(payload).map(key => arrValue.push(payload[key]))
    const updateOne = `UPDATE ${table} SET ${str} WHERE id=?`;
    arrValue.push(id);
    return await conn.query(updateOne,arrValue);
}

export const deleteByIdTable = async (id,table) => {
    const deleteSql = `UPDATE ${table} SET is_deleted=true WHERE id=?`;
    return await conn.query(deleteSql,[id]);
}

export const deleteOneTable = async (query,table) => {
    const { queryStr,arrValue } = returnQueryString(query)
    const sql = `UPDATE ${table} SET is_deleted=true WHERE ${queryStr}`;
    await conn.query(sql,arrValue);
}
