import Joi from '@hapi/joi';
import { subStatusEnum,dunningCodeEnum } from './subscription.constant.js';

export const subCreateValidate = (data) => {
    const schema = Joi.object({
        userId: Joi.number().required(),
        subStatus: Joi.string().valid(...Object.values(subStatusEnum)),
        dunningCode: Joi.number().valid(...Object.values(dunningCodeEnum)),
        billingDate: Joi.number().required(),
        currentIntervalStartDate: Joi.date().required(),
        currentIntervalEndDate: Joi.date().required()
    })
    return schema.validate(data);
}

export const subEditValidate = (data) => {
    const schema = Joi.object({
        subStatus: Joi.string().valid(...Object.values(subStatusEnum)),
        dunningCode: Joi.number().valid(...Object.values(dunningCodeEnum)),
        billingDate: Joi.number().required(),
        currentIntervalStartDate: Joi.date().required(),
        currentIntervalEndDate: Joi.date().required()
    })
    return schema.validate(data);
}