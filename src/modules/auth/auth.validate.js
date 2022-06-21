// const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
import Joi from '@hapi/joi';
const options = {
    errors: {
        wrap: {
            label: ''
        }
    },
    abortEarly: false,
    key: '"{{key}}" ',
    escapeHtml: true,
    language: {
        string: {
            base: '{{key}} '
        }
    }
};

export const authValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("firstname is not special characters").required(),
        lastname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("lastname is not special characters").required(),
        username: Joi.string().min(6).regex(/^[a-zA-Z0-9_.-]*$/).trim().required(),
        password: Joi.string().min(8).required(),
        email: Joi.string().email(),
        years_old: Joi.number().min(12)
        // fullName: Joi.string().min(6).required(),
        // accName: Joi.string().min(6).required()
        // phone: Joi.string().min(10).required(),
        // gender: Joi.string().min(4).required(),
        // dateBirth: Joi.date().format('YYYY-MM-DD').utc().required(),
        // addressId: Joi.string().max(200).required(),
        // address: Joi.string().max(200).required(),
        // idNumber: Joi.string().min(9).required(),
        // passport: Joi.string().min(6).required(),
        // password: Joi.string().required(),
        // otp: Joi.string().min(6).required(),
        // invested: Joi.number(),
        // dividends: Joi.number(),
        // commission: Joi.number(),
        // point: Joi.number(),
    });

    return schema.validate(data,options);
};

export const loginValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(6).required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data,options);
};

export const editUserValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("firstname is not special characters"),
        lastname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("lastname is not special characters"),
        password: Joi.string().min(8),
        email: Joi.string().email(),
        years_old: Joi.number().min(12)
    });
    return schema.validate(data,options);
};

// module.exports = { authValidation,loginValidation,editUserValidation };