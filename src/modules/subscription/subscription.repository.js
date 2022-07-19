import conn from "../../connection/connection.js";
import { createTable,deleteByIdTable,deleteOneTable,findByIdTable,findOneTable,findPaginationTable,findTable,updateOneByIdTable } from '../../shared/querySql.js';
import { statementStatusEnum } from '../statement/statement.constant.js';

const table = 'subscriptions'
const find = (query,fields) => findTable(query,fields,table);
const findPagination = (query,fields) => findPaginationTable(query,fields,table)
const findById = (id,fields) => findByIdTable(id,fields,table);
const findOne = (query,fields) => findOneTable(query,fields,table)
const create = async (payload) => createTable(payload,table);
const updateOne = async (id,payload) => updateOneByIdTable(id,payload,table);
const deleteById = async (id) => deleteByIdTable(id,table)
const deleteOne = async (query) => deleteOneTable(query,table);

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
