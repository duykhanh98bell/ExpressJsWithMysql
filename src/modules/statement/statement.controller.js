import conn from "../../connectDb/connection.js";
import { pagination } from "../adapter/pagination.js";
import { statementCreateValidate } from "./statement.validate.js";
import moment from 'moment-timezone';

export const findAllStatement = async (req,res) => {
    try {
        let sqlFilterAll = `select * from statements`
        const [statementCount] = await conn.query(sqlFilterAll);
        const responseHeader = await pagination(req.query,statementCount.length);
        if(responseHeader?.page) {
            sqlFilterAll += ` limit ${responseHeader.perPage} offset ${(responseHeader.page - 1) * responseHeader.perPage}`;
        }
        const [rows] = await conn.query(sqlFilterAll);
        return res.status(200).json({ rows,responseHeader });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const findOneStatement = async (req,res) => {
    try {
        const [statement] = await conn.query(`select * from statements where id=?`,[req.params.id]);
        if(!statement[0]) throw new Error(`Statement not found!`);
        return res.status(200).json({ rows: statement[0] })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

export const generateStatement = async (data) => {
    try {
        const { error } = statementCreateValidate(data);
        if(error) throw new Error(error.details[0].message);

        const {
            stmtStatus,
            subscriptionId,
            fleetPlan,
            creditLimit,
            totalCredit,
            totalDebit,
            statementStartDate,
            statementEndDate,
            gracePaymentDueDate,
            closingBalance,
            currentMonthBalance,
            previousBalance,
            totalPaid
        } = data

        const payload = {
            stmtStatus,
            subscriptionId: +subscriptionId,
            fleetPlan,
            creditLimit: +creditLimit || 0,
            totalCredit: +totalCredit || 0,
            totalDebit: +totalDebit || 0,
            statementStartDate: moment(statementStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            statementEndDate: moment(statementEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            gracePaymentDueDate: moment(gracePaymentDueDate).add(1,'month').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            closingBalance: +closingBalance || 0,
            currentMonthBalance: +currentMonthBalance || 0,
            previousBalance: +previousBalance || 0,
            totalPaid: +totalPaid || 0
        }
        const [rows] = await conn.query(`insert into statements set ?`,payload);
        return rows;
    } catch(error) {
        throw new Error(error);
    }
}