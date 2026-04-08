import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router();


router.route('/').get((req,res)=>{
    console.log("auth route is working ");
    res.send("auth route is working ");
})
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(authMiddleware(['tenant','manager']),logout);
export default router;