import cron from "cron";
import moment from "moment-timezone";
import { generateStatementFunc } from '../modules/subscription/subscription.controller';

const triggerDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
const job = new cron.CronJob({
    // cronTime: '* * * * *',
    cronTime: '0 0 15 * *',
    onTick: async () => {
        console.log('Cronjob running ...');
        try {
            await generateStatementFunc(triggerDate);
            console.log('Cronjob generate done!');
        } catch(error) {
            console.log('Cronjob failed!');
        }
    },
    start: true,
    timeZone: 'Asia/Ho_Chi_Minh'
});

job.start();

