import mysql from "mysql2";
// import AppError from '../shared/error.js';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mysql123!@',
    database: 'demo_db'
});

pool.getConnection(function(err,connection) {
    if(err) console.log('Mysql disconnected!');
    else {
        console.log('Mysql connected!');
        connection.release();
    }
});

export default pool.promise();

// let pool;

// export function init(config) {
//     pool = pool ? pool : mysql.createPool(config);
//     return pool;
// }

// export function getConnection() {
//     return new Promise((resolve,reject) => {
//         if(!pool) return reject(new AppError('pool is not ready','E101'));
//         pool.getConnection((err,connection) => {
//             if(err) return reject(err);
//             else resolve(connection);
//         });
//     });
// }