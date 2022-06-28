// import { checkUser } from "../auth/auth.controller.js";
import moment from 'moment-timezone';
import { subCreateValidate,subEditValidate } from "./subscription.validate.js";
import subscriptionService from './subscription.service.js';
// import Logger from "lib-logger";
import AppError from '../../shared/error.js';

const createSubscription = async (req,res) => {
    try {
        const { error } = subCreateValidate(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        await subscriptionService.createSubscription(req.body);
        res.sendJson({ message: "Added subscription successfully!" });
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}

const getSubscription = async (req,res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        res.sendJson({ rows: subscription });
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}

const getSubscriptionList = async (req,res) => {
    try {
        const rows = await subscriptionService.getSubscriptions(req.query);
        res.sendJson(rows);
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}

const editSubscription = async (req,res) => {
    try {
        const { error } = subEditValidate(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        await subscriptionService.editSubscription(req.params.id,req.body);
        res.sendJson({ message: "Updated subscription successfully!" });
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}

const deleteSubscription = async (req,res) => {
    try {
        await subscriptionService.deleteSubscription(req.params.id);
        res.sendJson({ message: 'Deleted subscription' });
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}


const triggerGenStatement = async (req,res) => {
    try {
        const triggerDate = moment(req.body.currentTime).startOf('day').format('YYYY-MM-DD HH:mm:ss');

        if(moment().startOf('day').isBefore(triggerDate)) {
            throw new AppError({ message: 'Can not trigger for future!' });
        }
        const userIdGeneratedStatement = await subscriptionService.generateStatementFunc(triggerDate);
        res.sendJson({ rows: userIdGeneratedStatement })
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}

const triggerGenerateDunning = async (req,res) => {
    try {
        const triggerDate = moment(req.body.currentTime).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        if(moment().startOf('day').isBefore(triggerDate)) {
            throw new AppError({ message: 'Can not trigger for future!' });
        }
        await subscriptionService.genDunningRawFile(triggerDate);
        res.sendJson({ message: 'Generated!' });
    } catch(error) {
        res.sendError({ message: error.message,code: error.code })
    }
}

export default {
    getSubscription,
    getSubscriptionList,
    createSubscription,
    editSubscription,
    deleteSubscription,
    triggerGenStatement,
    triggerGenerateDunning
}