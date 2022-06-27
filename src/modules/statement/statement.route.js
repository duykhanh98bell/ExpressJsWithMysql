import express from 'express'
import subscriptionController from '../subscription/subscription.controller.js';
import statementController from "./statement.controller.js";
const router = express.Router();

router.get("/",statementController.findAllStatement);
router.get("/:id",statementController.findOneStatement);
router.put("/triggerGenStatement",subscriptionController.triggerGenStatement);
router.put("/triggerGenDunning",subscriptionController.triggerGenerateDunning);

export default router;