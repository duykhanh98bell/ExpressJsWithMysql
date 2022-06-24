import express from 'express'
import { verifyToken } from '../verifyToken/verifyToken.js';
import { createNewUser,deleteUser,editUser,findOne,getAllUsers,login,register } from './auth.controller.js';
const router = express.Router();

router.get("/register",register);

router.post("/login",login);
router.post("/",createNewUser);

router.get("/",verifyToken,getAllUsers);
router.get("/:id",findOne);
router.put("/:id",editUser);
router.delete("/:id",deleteUser);

export default router;