// import { checkUser } from "../auth/auth.controller.js";
import moment from 'moment-timezone';
import { subCreateValidate,subEditValidate } from "./subscription.validate.js";
import subscriptionService from './subscription.service.js';
import Logger from "lib-logger";

const createSubscription = async (req,res) => {
    try {
        const { error } = subCreateValidate(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        await subscriptionService.createSubscription(req.body);
        return res.status(201).json({ message: "Added subscription successfully!" });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

const getSubscription = async (req,res) => {
    try {
        const subscription = await subscriptionService.getSubscription(req.params.id);
        return res.status(200).json({ rows: subscription });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

const getSubscriptionList = async (req,res) => {
    try {
        const rows = await subscriptionService.getSubscriptions(req.query);
        return res.status(200).json(rows);
    } catch(error) {
        return res.json({ message: error.message });
    }
}

const editSubscription = async (req,res) => {
    try {
        const { error } = subEditValidate(req.body);
        if(error) return res.status(400).json({ message: error.details[0].message });

        await subscriptionService.editSubscription(req.params.id,req.body);
        return res.status(201).json({ message: "Updated subscription successfully!" });
    } catch(error) {
        return res.json({ message: error.message });
    }
}

const deleteSubscription = async (req,res) => {
    try {
        Logger.debug('dfasd')
        await subscriptionService.deleteSubscription(req.params.id);
        return res.status(201).json({ message: 'Deleted subscription' });
    } catch(error) {
        return res.json({ message: error.message });
    }
}


const triggerGenStatement = async (req,res) => {
    try {
        const triggerDate = moment(req.body.currentTime).startOf('day').format('YYYY-MM-DD HH:mm:ss');

        if(moment().startOf('day').isBefore(triggerDate)) {
            throw new Error('Can not trigger for future!');
        }
        const userIdGeneratedStatement = await subscriptionService.generateStatementFunc(triggerDate);
        return res.status(201).json({ userIdGeneratedStatement })
    } catch(error) {
        return res.json({ message: error.message });
    }
}

const triggerGenerateDunning = async (req,res) => {
    try {
        const triggerDate = moment(req.body.currentTime).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        if(moment().startOf('day').isBefore(triggerDate)) {
            throw new Error('Can not trigger for future!');
        }
        await subscriptionService.genDunningRawFile(triggerDate);
        return res.status(201).json({ message: 'Generated!' });
    } catch(error) {
        return res.json({ message: error.message })
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