import express from 'express'
import subscriptionController from './subscription.controller.js';
const router = express.Router();

router.get('/',subscriptionController.getSubscriptionList);
router.get('/:id',subscriptionController.getSubscription);
router.post('/',subscriptionController.createSubscription);
router.put('/:id',subscriptionController.editSubscription);
router.delete('/:id',subscriptionController.deleteSubscription);

export default router