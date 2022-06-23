// const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
import Joi from '@hapi/joi';

export const authValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("firstname is not special characters").required(),
        lastname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("lastname is not special characters").required(),
        username: Joi.string().min(6).regex(/^[a-zA-Z0-9_.-]*$/).trim().required(),
        password: Joi.string().min(8).required(),
        email: Joi.string().email(),
        years_old: Joi.number().min(12)
    });

    return schema.validate(data);
};

export const loginValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(6).required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};

export const editUserValidation = (data) => {
    const schema = Joi.object({
        firstname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("firstname is not special characters"),
        lastname: Joi.string().min(1).regex(/^[a-zA-Z]+$/).message("lastname is not special characters"),
        email: Joi.string().email(),
        years_old: Joi.number().min(12)
    });
    return schema.validate(data);
};