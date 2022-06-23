import Joi from '@hapi/joi';
import { statementStatusEnum,fleetPlan } from './statement.constant.js';

export const statementCreateValidate = (data) => {
    const schema = Joi.object({
        stmtStatus: Joi.string().valid(...Object.values(statementStatusEnum)),
        subscriptionId: Joi.number().required(),
        fleetPlan: Joi.string().valid(...Object.values(fleetPlan)),
        creditLimit: Joi.number(),
        totalCredit: Joi.number(),
        totalDebit: Joi.number(),
        statementStartDate: Joi.date().required(),
        statementEndDate: Joi.date().required(),
        gracePaymentDueDate: Joi.date().required(),
        closingBalance: Joi.number(),
        currentMonthBalance: Joi.number(),
        previousBalance: Joi.number(),
        totalPaid: Joi.number(),
    })
    return schema.validate(data);
}