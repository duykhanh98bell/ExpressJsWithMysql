import { escape } from 'mysql2';
import conn from "../../connectDb/connection.js";
import { pagination } from '../adapter/pagination.js';
import { statementStatusEnum } from '../statement/statement.constant.js';

const find = async () => {
    const [rows] = await conn.query(`SELECT * FROM subscriptions WHERE is_deleted=0`);
    return rows
}

const findPagination = async (query) => {
    let sql = 'SELECT * FROM subscriptions WHERE is_deleted=0';
    const [countRecords] = await conn.query(sql);
    const responseHeader = await pagination(query,countRecords.length);
    if(responseHeader?.page) {
        sql += ` limit ${escape(responseHeader.perPage)} offset ${escape((responseHeader.page - 1) * responseHeader.perPage)}`;
    }
    const [rows] = await conn.query(sql);
    return { rows,responseHeader }
}

const findById = async (id) => {
    const sql = 'SELECT * FROM subscriptions WHERE id = ? AND is_deleted=0';
    const [rows] = await conn.query(sql,[id]);
    return rows[0];
}

const findOne = async (obj,fields) => {
    const strKey = Object.keys(obj).map(key => key + "=?").join("AND ");
    const returnFields = fields ? Object.keys(fields).map(key => fields[key] && `${key}`).join(", ") : ' * ';
    const arrValue = [];
    Object.keys(obj).map(key => arrValue.push(obj[key]))
    const sql = `SELECT ${returnFields} FROM subscriptions WHERE is_deleted=0 AND ${strKey}`;
    const [rows] = await conn.query(sql,arrValue);
    return rows[0];
}

const create = async (payload) => {
    const sqlInsert = "INSERT INTO subscriptions SET ?";
    return await conn.query(sqlInsert,payload);
}

const updateOne = async (id,payload) => {
    const str = Object.keys(payload).map(key => key + "=?").join(", ");
    const arrValue = [];
    Object.keys(payload).map(key => arrValue.push(payload[key]))
    const updateOne = `UPDATE subscriptions SET ${str} WHERE id=?`;
    arrValue.push(id);
    return await conn.query(updateOne,arrValue);
}

const deleteById = async (id) => {
    const deleteSql = `UPDATE subscriptions SET is_deleted=true WHERE id=?`;
    return await conn.query(deleteSql,[id]);
}

const deleteOne = async (obj) => {
    const strKey = Object.keys(obj).map(key => key + "=?").join("AND ");
    const arrValue = [];
    Object.keys(obj).map(key => arrValue.push(obj[key]))
    const sql = `UPDATE users SET is_deleted=true WHERE ${strKey}`;
    await conn.query(sql,arrValue);
}

const statementOverDue = async (date) => {
    const [rows] = await conn.query(
        `
            select userId 
            from statements 
                inner join subscriptions on statements.subscriptionId = subscriptions.id
                inner join users on users.id = subscriptions.userId
            where stmtStatus='${statementStatusEnum.OVERDUE}' AND gracePaymentDueDate < '${date}'
        `
    );
    return rows
}

const statementMonthsAgo = async (userId,date) => {
    const [rows] = await conn.query(
        `
            select * 
            from statements
                inner join subscriptions on statements.subscriptionId = subscriptions.id
                inner join users on users.id = subscriptions.userId
            where userId = ${userId} AND gracePaymentDueDate < '${date}'
        `
    );
    return rows
}

const currentMonth = async (userId,date) => {
    const [rows] = await conn.query(
        `
            select * 
            from statements
                inner join subscriptions on statements.subscriptionId = subscriptions.id
                inner join users on users.id = subscriptions.userId
            where userId = ${userId} AND gracePaymentDueDate >= '${date}'
        `
    );
    return rows
}


export default {
    find,
    findPagination,
    findById,
    findOne,
    create,
    updateOne,
    deleteById,
    deleteOne,
    statementOverDue,
    statementMonthsAgo,
    currentMonth
};
