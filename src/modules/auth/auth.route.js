import express from 'express'
import { verifyToken } from '../verifyToken/verifyToken.js';
import authController from './auth.controller.js';
const router = express.Router();

router.post("/login",authController.login);
router.post("/logout",authController.login);
router.post("/refreshToken",authController.refreshToken);
router.post("/",authController.createNewUser);

router.get("/",verifyToken,authController.getAllUsers);
router.get("/:id",verifyToken,authController.findOne);
router.put("/:id",authController.editUser);
router.delete("/:id",authController.deleteUser);

export default router;