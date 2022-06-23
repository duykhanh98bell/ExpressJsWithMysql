// import { curry,toString,trim,flow,replace,padCharsStart,padEnd } from 'lodash/fp';
import moment from "moment-timezone";
import _ from "lodash";

const momentFormat = _.curry((format,value) => moment(value).format(format));
export const formatYYYYMMDD = momentFormat('YYYYMMDD');

// 'padEnd    '

const convertString = _.flow(_.toString,_.trim);
const sliceFirstString = _.curry((end,text) => text.slice(0,end));
const padEndCustom = _.curry((length,value) =>
    _.flow(convertString,_.padEnd(length),sliceFirstString(length))(value),
);

export const padEnd1 = padEndCustom(1);
export const padEnd5 = padEndCustom(5);
export const padEnd10 = padEndCustom(10);
export const padEnd12 = padEndCustom(12);

// '+00000000001000'
// const convertNumberMinusAndPlus = _.curry((realValue,valueText) => {
//     if(realValue < 0) {
//         return `-${valueText}`;
//     }
//     return `+${valueText}`;
// })

// const padCharsStartMinusOrPlus = _.curry((char,length) =>
//     _.curry((len,value) =>
//         _.flow(
//             _.toString,
//             _.replace('.',''),
//             _.padCharsStart(char)(len - 1),
//             convertNumberMinusAndPlus(value),
//         )(Math.abs(value).toFixed(3)),
//     )(length),
// );

const padCharsStartMinusOrPlus = (value,length,text) => {
    if(value < 0) {
        return `-${_.replace(_.padStart(Math.abs(value).toFixed(3),length,text),'.','')}`;
    }
    return `+${_.replace(_.padStart(Math.abs(value).toFixed(3),length,text),'.','')}`;
}

const padCharsStartPlusOrMinusZero = (value,length) => padCharsStartMinusOrPlus(value,length,'0');

export const padCharsStartPlusOrMinusZero10 = (value) => padCharsStartPlusOrMinusZero(value,10);