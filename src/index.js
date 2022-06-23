import dotenv from "dotenv";
dotenv.config();
import express from 'express';
const app = express()
const port = process.env.PORT;
import pkg from 'body-parser';
const { json } = pkg;
import { login,register,getAllUsers,findOne,createNewUser,editUser,deleteUser } from "./modules/auth/auth.controller.js";
import { createSubscription,getSubscription,getSubscriptionList,editSubscription,deleteOne,triggerGenStatement,triggerGenerateDunning } from "./modules/subscription/subscription.controller.js";
import { findAllStatement,findOneStatement } from "./modules/statement/statement.controller.js";

app.use(json());

app.get('/',(req,res) => {
    res.send('Hello World!')
})

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
app.delete('/subscription/:id',deleteOne);

app.get('/statement/',findAllStatement);
app.get('/statement/:id',findOneStatement);

app.put('/statement/triggerGenStatement',triggerGenStatement);
app.put('/statement/triggerGenDunning',triggerGenerateDunning);

app.listen(port,() => {
    console.log(`Example app listening on port ${port}`)
})