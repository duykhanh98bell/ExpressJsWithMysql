import dotenv from "dotenv";
dotenv.config();
import express from 'express';
const app = express()
const port = process.env.PORT;
import pkg from 'body-parser';
const { json } = pkg;
import { login,register,getAllUsers,findOne,createNewUser,editUser,deleteUser } from "./modules/auth/auth.controller.js";
import { createSubscription,getSubscription,getSubscriptionList,editSubscription } from "./modules/subscription/subscription.controller.js";

// middleware
app.use(json());

// connect MySql
// const conn = require("./connectDb/connection");

app.get('/',(req,res) => {
    res.send('Hello World!')
})

// route
// import authRouter from "./routers/auth.route.js";
// import subscriptionRouter from './routers/subscription.route.js';

app.post('/auth/login',login);
app.get('/auth/register',register);
app.get('/auth/',getAllUsers);
app.get('/auth/:id',findOne);
app.post('/auth/',createNewUser);
app.put('/auth/:id',editUser);
app.delete('/auth/:id',deleteUser);

app.post('/subscription/',createSubscription);
app.get('/subscription/:id',getSubscription);
app.get('/subscription/',getSubscriptionList);
app.put('/subscription/:id',editSubscription);

// app.use('/auth',authRouter);
// app.use('/subscription',subscriptionRouter);

app.listen(port,() => {
    console.log(`Example app listening on port ${port}`)
})