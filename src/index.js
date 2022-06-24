import dotenv from "dotenv";
dotenv.config();
import express from 'express';
const app = express()
const port = process.env.PORT;
import pkg from 'body-parser';
const { json } = pkg;
import { createSubscription,getSubscription,getSubscriptionList,editSubscription,deleteOne,triggerGenStatement,triggerGenerateDunning } from "./modules/subscription/subscription.controller.js";
import { findAllStatement,findOneStatement } from "./modules/statement/statement.controller.js";
import authRoute from "./modules/auth/auth.route.js";

app.use(json());

app.get('/',(req,res) => {
    res.send('Hello World!')
})


// app.post('/auth',login);
app.use('/auth',authRoute);

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