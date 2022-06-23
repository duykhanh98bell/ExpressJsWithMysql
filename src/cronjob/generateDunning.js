import cron from "cron";
import moment from "moment-timezone";
import { genDunningRawFile } from '../modules/subscription/subscription.controller.js';

const triggerDate = moment('2022-06-15').startOf('day').format('YYYY-MM-DD HH:mm:ss');
const job = new cron.CronJob({
    cronTime: '* * * * *',
    // cronTime: '0 0 15 * *',
    onTick: async () => {
        console.log('Cronjob running ...');
        try {
            await genDunningRawFile(triggerDate);
            console.log('Cronjob generate done!');
        } catch(error) {
            console.log('Cronjob failed! ',error.message);
        }
    },
    start: true,
    timeZone: 'Asia/Ho_Chi_Minh'
});

job.start();

