import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import pkg from 'body-parser';
import authRoute from "./modules/auth/auth.route.js";
import statementRoute from "./modules/statement/statement.route.js";
import subscriptionRoute from "./modules/subscription/subscription.route.js";
import conn from './connection/connection.js';
import startRedis from './connection/redisConfig.js'
import response from './shared/customResponse.js';
import compression from "compression";
import limiter from './middleware/rateLimit.js';
const app = express()
const port = process.env.PORT;
const { json } = pkg;

conn;
startRedis;
app.use(limiter)
app.use(response())
app.use(json());
app.use(compression())

app.get('/',(req,res) => {
    res.send('Hello World!')
})

app.use('/auth',authRoute);
app.use('/statement',statementRoute)
app.use('/subscription',subscriptionRoute)

app.listen(port,() => {
    console.log(`Example app listening on port ${port}`)
})