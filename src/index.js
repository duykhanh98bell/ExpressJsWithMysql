import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import pkg from 'body-parser';
import authRoute from "./modules/auth/auth.route.js";
import statementRoute from "./modules/statement/statement.route.js";
import subscriptionRoute from "./modules/subscription/subscription.route.js";
const app = express()
const port = process.env.PORT;
const { json } = pkg;

app.use(json());

app.get('/',(req,res) => {
    res.send('Hello World!')
})

app.use('/auth',authRoute);

app.use('/statement',statementRoute)

app.use('/subscription',subscriptionRoute)

app.listen(port,() => {
    console.log(`Example app listening on port ${port}`)
})