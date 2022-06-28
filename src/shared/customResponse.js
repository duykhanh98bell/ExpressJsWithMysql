// import * as mysql from "../mysql_connector";

import error_code from './error_code.js';

export default function response() {
    return function(req,res,next) {
        res.sendJson = function({ message,rows,responseHeader }) {
            let tmp = {
                status: 'success',
                message: message || 'success',
                items: rows || {},
            };
            if(responseHeader) {
                tmp.responseHeader = responseHeader || {};
            }
            res.statusCode = 200;
            res.json(tmp);
            // authLog(req, 'success');
        };

        /**
         *
         * @param code
         * @param message
         * @param httpStatusCode
         * @param data
         * @param messFormat
         */
        res.sendError = function({ code,message,httpStatusCode,data }) {
            if(!code) code = '400';
            message = message || error_code[code];

            res.statusCode = httpStatusCode * 1 || 200;
            if(res.statusCode === 401) {
                res.setHeader("WWW-Authenticate",'Bearer realm="Users", error="invalid_token"');
            }
            res.json({
                message: message,
                status: 'error',
                error_code: code,
                data: data
            });
            // authLog(req, 'fail');
        };

        next();
    }
}

// export function authLog(req, status, level = 1) {
//     if (req.action !== undefined && req.user) mysql.query(`INSERT INTO user_log (user_id, username, action, body, query, param, api, method, user_agent, referer, ip, level, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now());`, [req.user.user_id, req.user.username, req.action, JSON.stringify(req.body), JSON.stringify(req.query), JSON.stringify(req.params), req.originalUrl, req.method, req.headers['user-agent'], req.headers['referer'], req.headers['x-forwarded-for'] || req.connection.remoteAddress, level, status]).catch(e => {
//         console.log('authLog', req.originalUrl, e.toString());
//     });
// }