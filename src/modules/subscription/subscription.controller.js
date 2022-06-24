import { checkUser,verifyNumberId } from "../auth/auth.controller.js";
import moment from 'moment-timezone';
import conn from "../../connectDb/connection.js";
import { subCreateValidate,subEditValidate } from "./subscription.validate.js";
import _ from 'lodash';
import { pagination } from "../adapter/pagination.js";
import { generateStatement } from "../statement/statement.controller.js";
import { statementStatusEnum,fleetPlan,FILE_IND } from "../statement/statement.constant.js";
import { formatYYYYMMDD,padCharsStartPlusOrMinusZero10 } from '../statement/statement.utils.js';
import fs from 'fs';
import { escape } from "mysql2";

const findSubscriptionByUserId = async (userId) => {
    const [rows] = await conn.query(`select * from subscriptions where userId = ?`,[userId]);
    if(!_.isEmpty(rows)) throw new Error('User has been created subscription!');
    return rows[0];
}

export const createSubscription = async (req,res) => {
    try {
        const { error } = subCreateValidate(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        await Promise.all([
            checkUser(req.body.userId),
            findSubscriptionByUserId(req.body.userId),
        ]);

        const payloadCreateSub = [
            +req.body.userId,
            req.body.subStatus,
            +req.body.dunningCode,
            +req.body.billingDate,
            moment(req.body.currentIntervalStartDate).add(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment(req.body.currentIntervalStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment(req.body.currentIntervalEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ]
        const sqlInsert =
            `INSERT INTO subscriptions 
            (userId, subStatus, dunningCode, billingDate, billingAt, currentIntervalStartDate, currentIntervalEndDate) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?)`;
        await conn.query(sqlInsert,payloadCreateSub);
        console.log(payloadCreateSub);
        return res.status(201).json({ message: "Added subscription successfully!" });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const getSubscription = async (req,res) => {
    try {
        verifyNumberId(req.params.id);
        const [rows] = await conn.query(`select * from subscriptions where id=?`,[req.params.id]);
        return res.status(200).json({ rows: rows[0] });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const getSubscriptionList = async (req,res) => {
    try {
        let sqlFilter = `select * from subscriptions`;
        const [countRecords] = await conn.query(sqlFilter);
        const responseHeader = await pagination(req.query,countRecords.length);
        if(responseHeader?.page) {
            sqlFilter += ` limit ${escape(responseHeader.perPage)} offset ${escape((responseHeader.page - 1) * responseHeader.perPage)}`;
        }
        const [rows] = await conn.query(sqlFilter);
        return res.status(200).json({ rows,responseHeader });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const editSubscription = async (req,res) => {
    try {
        verifyNumberId(req.params.id);
        const { error } = subEditValidate(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        const [rows] = await conn.query(`select * from subscriptions where id = ?`,[req.params.id]);
        if(!rows[0]) throw new Error('This subscription is the undefined!')

        const payloadEditSub = {
            subStatus: req.body?.subStatus,
            dunningCode: +req.body?.dunningCode,
        }
        const str = Object.keys(req.body).map(key => key + "=" + `'${req.body[key]}'`).join(", ");
        const sqlEdit =
            `update subscriptions SET ${str} where id=?`;
        await conn.query(sqlEdit,[req.params.id]);
        console.log(payloadEditSub);
        return res.status(201).json({ message: "Updated subscription successfully!" });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const deleteOne = async (req,res) => {
    try {
        verifyNumberId(req.params.id);
        const [rows] = await conn.query(`select * from subscriptions where id = ?`,[req.params.id]);
        if(!rows[0]) throw new Error('This subscription is the undefined!')
        await conn.query(`delete from subscriptions where id = ?`,[req.params.id]);
        return res.status(201).json({ message: 'Deleted subscription' });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

const updateBillingDateSub = async (start,end,billingAt,id) => {
    try {
        const payloadEdit = [
            moment(start).add(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment(end).add(1,'month').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            moment(billingAt).add(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            id
        ]
        const sqlEdit =
            `update subscriptions 
            SET currentIntervalStartDate=?, currentIntervalEndDate=?, billingAt=?
            where id=?`;
        await conn.query(sqlEdit,payloadEdit);
    } catch(error) {
        throw new Error(`Update billing cycle is failed!`);
    }
}

export const triggerGenStatement = async (req,res) => {
    try {
        const triggerDate = moment(req.body.currentTime).startOf('day').format('YYYY-MM-DD HH:mm:ss');

        if(moment().startOf('day').isBefore(triggerDate)) {
            throw new Error('Can not trigger for future!');
        }
        const userIdGeneratedStatement = await generateStatementFunc(triggerDate);
        return res.status(201).json({ userIdGeneratedStatement })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const generateStatementFunc = async (triggerDate) => {
    try {
        if(moment(triggerDate).date() != 15) {
            throw new Error('Generate only 15th of every month');
        }
        const [SubscriptionList] = await conn.query(`select * from subscriptions where billingAt=?`,[triggerDate])
        let userIdGeneratedStatement = [];
        for(const subscription of SubscriptionList) {
            const result = await generateStatement({
                stmtStatus: statementStatusEnum.OVERDUE,
                subscriptionId: subscription.id,
                fleetPlan: fleetPlan.POSTPAID,
                creditLimit: 10000,
                totalCredit: 0,
                totalDebit: -10,
                statementStartDate: subscription.currentIntervalStartDate,
                statementEndDate: subscription.currentIntervalEndDate,
                gracePaymentDueDate: subscription.currentIntervalEndDate,
                closingBalance: -10,
                currentMonthBalance: -10,
                previousBalance: 0,
                totalPaid: 0
            })
            if(result.insertId) {
                await updateBillingDateSub(
                    subscription.currentIntervalStartDate,
                    subscription.currentIntervalEndDate,
                    subscription.billingAt,
                    subscription.id
                );
            }
            userIdGeneratedStatement.push(subscription.userId);
        }
        return userIdGeneratedStatement;
    } catch(error) {
        throw new Error(error.message);
    }
}

export const triggerGenerateDunning = async (req,res) => {
    try {
        const triggerDate = moment(req.body.currentTime).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        if(moment().startOf('day').isBefore(triggerDate)) {
            throw new Error('Can not trigger for future!');
        }
        await genDunningRawFile(triggerDate);
        return res.status(201).json({ message: 'Generated!' });
    } catch(error) {
        return res.json({ message: error.message })
    }
}

export const genDunningRawFile = async (triggerDate) => {
    try {
        if(moment(triggerDate).date() != 15) {
            throw new Error('Generate only 15th of every month');
        }
        console.log('Start generate dunning file');
        const [statementOverdue] = await conn.query(
            `
                select userId 
                from statements 
                    inner join subscriptions on statements.subscriptionId = subscriptions.id
                    inner join users on users.id = subscriptions.userId
                where stmtStatus='${statementStatusEnum.OVERDUE}' AND gracePaymentDueDate < '${triggerDate}'
            `
        );
        const fileName = `${formatYYYYMMDD(triggerDate)}.txt`;
        const listDunning = [];
        const userIdDistinct = [...new Set(statementOverdue)];
        for(const userIdObj of userIdDistinct) {
            const [[statementMonthsAgo],[currentMonth]] = await Promise.all([
                conn.query(`
                    select * 
                    from statements
                        inner join subscriptions on statements.subscriptionId = subscriptions.id
                        inner join users on users.id = subscriptions.userId
                    where userId = ${userIdObj.userId} AND gracePaymentDueDate < '${triggerDate}'
                `),
                conn.query(`
                    select * 
                    from statements
                        inner join subscriptions on statements.subscriptionId = subscriptions.id
                        inner join users on users.id = subscriptions.userId
                    where userId = ${userIdObj.userId} AND gracePaymentDueDate >= '${triggerDate}'
                `),
            ])
            let balance30days = 0;
            let balance60days = 0;
            let balance90days = 0;
            let balance120daysAndMore = 0;
            let fileIndicator = FILE_IND.CR01;
            for(const statement of statementMonthsAgo) {
                switch(moment(triggerDate).diff(moment(statement.gracePaymentDueDate),'month') + 1) {
                    case 1:
                        balance30days += statement.currentMonthBalance || 0;
                        fileIndicator = FILE_IND.CR01;
                        break;
                    case 2:
                        balance60days += statement.currentMonthBalance || 0;
                        fileIndicator = FILE_IND.CR02;
                        break;
                    case 3:
                        balance90days += statement.currentMonthBalance || 0;
                        fileIndicator = FILE_IND.CR03;
                        break;
                    case 4:
                        balance120daysAndMore += statement.currentMonthBalance || 0;
                        fileIndicator = FILE_IND.CR04;
                        break;
                    default:
                        break;
                }
            }
            const data = [
                'DUN_FILE',
                _.padEnd(fileIndicator,10),
                _.padEnd(formatYYYYMMDD(triggerDate),12),
                _.padEnd(currentMonth[0]?.email,12),
                _.padEnd(currentMonth[0]?.username,12),
                _.padEnd(currentMonth[0]?.years_old,12),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.previousBalance),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.currentMonthBalance),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.creditLimit),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.totalCredit),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.totalDebit),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.totalPaid),
                padCharsStartPlusOrMinusZero10(currentMonth[0]?.closingBalance),
                padCharsStartPlusOrMinusZero10(balance30days),
                padCharsStartPlusOrMinusZero10(balance60days),
                padCharsStartPlusOrMinusZero10(balance90days),
                padCharsStartPlusOrMinusZero10(balance120daysAndMore),

            ].join("");
            listDunning.push(data);
        }
        listDunning.join('\n');
        fs.writeFileSync(fileName,...listDunning);
        return statementOverdue;
    } catch(error) {
        throw new Error(error.message);
    }
}