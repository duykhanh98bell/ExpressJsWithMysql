import mysql from "mysql2";
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mysql123!@',
    database: 'demo_db'
}).promise();

export default pool;