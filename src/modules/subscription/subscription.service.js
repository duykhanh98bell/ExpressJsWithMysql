import subscriptionRepository from './subscription.repository.js'
import moment from 'moment-timezone';
import authRepository from '../auth/auth.repository.js';
import { v4 as uuidv4 } from 'uuid';
import { statementStatusEnum,fleetPlan,FILE_IND } from "../statement/statement.constant.js";
import statementService from '../statement/statement.service.js';
import { formatYYYYMMDD,padCharsStartPlusOrMinusZero10 } from '../statement/statement.utils.js';
import fs from 'fs';
import _ from 'lodash';
import statementRepository from '../statement/statement.repository.js';


const getSubscriptions = async (query) => {
    return await subscriptionRepository.findPagination(query);
}

const getSubscription = async (id) => {
    return await subscriptionRepository.findById(id);
}

const createSubscription = async (payload) => {
    const payloadCreateSub = {
        id: uuidv4(),
        userId: payload.userId,
        subStatus: payload.subStatus,
        dunningCode: Number(payload.dunningCode),
        billingDate: Number(payload.billingDate),
        currentIntervalStartDate: moment(payload.currentIntervalStartDate).add(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        currentIntervalEndDate: moment(payload.currentIntervalStartDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        billingAt: moment(payload.currentIntervalEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    }

    const [isUser,isSubscription] = await Promise.all([
        authRepository.findById(payload.userId),
        subscriptionRepository.findOne({ userId: payload.userId })
    ])
    if(!isUser) throw new Error('User not found')
    if(isSubscription) throw new Error('User has been created subscription!')

    await subscriptionRepository.create(payloadCreateSub);
}

const editSubscription = async (id,payload) => {
    const isSubscription = await subscriptionRepository.findById(id);
    if(!isSubscription) throw new Error('This subscription is the undefined!');

    return await subscriptionRepository.updateOne(id,payload)
}

const deleteSubscription = async (id) => {
    const isSubscription = await subscriptionRepository.findById(id);
    if(!isSubscription) throw new Error('This subscription is the undefined!');

    return await subscriptionRepository.deleteById(id)
}

const generateStatementFunc = async (triggerDate) => {
    if(moment(triggerDate).date() != 15) {
        throw new Error('Generate only 15th of every month');
    }
    const [SubscriptionList] = await subscriptionRepository.findOne({ billingAt: triggerDate });
    let userIdGeneratedStatement = [];
    for(const subscription of SubscriptionList) {
        const result = await statementService.generateStatement({
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
}

const updateBillingDateSub = async (start,end,billingAt,id) => {
    const payloadEdit = [
        moment(start).add(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        moment(end).add(1,'month').endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        moment(billingAt).add(1,'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        id
    ]
    await subscriptionRepository.updateOne(id,payloadEdit)
}

const genDunningRawFile = async (triggerDate) => {
    if(moment(triggerDate).date() != 15) {
        throw new Error('Generate only 15th of every month');
    }
    console.log('Start generate dunning file');
    const statementOverDue = await subscriptionRepository.statementOverDue(triggerDate);

    const fileName = `${formatYYYYMMDD(triggerDate)}.txt`;
    const listDunning = [];
    const userIdDistinct = [...new Set(statementOverDue)];
    for(const userIdObj of userIdDistinct) {
        const [statementMonthsAgo,currentMonth] = await Promise.all([
            statementRepository.statementMonthsAgo(userIdObj.userId,triggerDate),
            statementRepository.currentMonth(userIdObj.userId,triggerDate)
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
    return statementOverDue;
}

export default {
    getSubscriptions,
    getSubscription,
    createSubscription,
    editSubscription,
    deleteSubscription,
    generateStatementFunc,
    genDunningRawFile
}