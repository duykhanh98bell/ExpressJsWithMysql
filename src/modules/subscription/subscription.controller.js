import { checkUser } from "../auth/auth.controller.js";
import moment from 'moment-timezone';
import conn from "../../connectDb/connection.js";
import { subCreateValidate,subEditValidate } from "./subscription.validate.js";
import _ from 'lodash';
import { pagination } from "../adapter/pagination.js";

const findSubscriptionByUserId = async (userId) => {
    const [rows] = await conn.query(`select * from subscriptions where userId = ?`,[userId]);
    if(!_.isEmpty(rows)) throw new Error('User has been created subscription!');
    return rows[0];
}

export const createSubscription = async (req,res) => {
    try {
        const { error } = subCreateValidate(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        await checkUser(req.body.userId);
        await findSubscriptionByUserId(req.body.userId);

        const payloadCreateSub = [
            +req.body.userId,
            req.body.subStatus,
            +req.body.dunningCode,
            +req.body.billingDate,
            moment(req.body.currentIntervalStartDate).tz('Asia/Ho_Chi_Minh').startOf('day').toDate(),
            moment(req.body.currentIntervalEndDate).tz('Asia/Ho_Chi_Minh').endOf('day').toDate(),
        ]
        const sqlInsert =
            `INSERT INTO subscriptions 
            (userId, subStatus, dunningCode, billingDate, currentIntervalStartDate, currentIntervalEndDate) 
            VALUES 
            (?, ?, ?, ?, ?, ?)`;
        await conn.query(sqlInsert,payloadCreateSub);
        console.log(payloadCreateSub);
        return res.json({ message: "Added subscription successfully!" });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const getSubscription = async (req,res) => {
    try {
        const [rows] = await conn.query(`select * from subscriptions where id=?`,[req.params.id]);
        return res.json({ rows: rows[0] });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const getSubscriptionList = async (req,res) => {
    try {
        let sqlFilter = `select * from subscriptions`;
        const [countRecords] = await conn.query(sqlFilter);
        const responseHeader = await pagination(req.query,countRecords.length);
        if(responseHeader?.perPage && responseHeader?.page) {
            sqlFilter += ` limit ${responseHeader.perPage} offset ${(responseHeader.page - 1) * responseHeader.perPage}`;
        }
        const [rows] = await conn.query(sqlFilter);
        return res.json({ rows,responseHeader });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const editSubscription = async (req,res) => {
    try {
        const { error } = subEditValidate(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        const [rows] = await conn.query(`select * from subscriptions where id = ?`,[req.params.id]);
        if(!rows[0]) throw new Error('This subscription is the undefined!')

        const payloadEditSub = [
            req.body?.subStatus
            + req.body?.dunningCode,
            +req.body.billingDate,
            moment(req.body.currentIntervalStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment(req.body.currentIntervalEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            req.params.id
        ]
        const sqlInsert =
            `update subscriptions 
            SET subStatus=?, dunningCode=?, billingDate=?, currentIntervalStartDate=?, currentIntervalEndDate=?
            where id=?`;
        await conn.query(sqlInsert,payloadEditSub);
        console.log(payloadEditSub);
        return res.json({ message: "Updated subscription successfully!" });
    } catch(error) {
        return res.json({ message: error.message });
    }
}