import { Router } from "express";
import { getLease, getLeasePayment } from "../controllers/lease.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();


router.route('/').get(authMiddleware(['tenant','manager']),getLease);

router.route('/:id/payments').get(authMiddleware(['tenant','manager']),getLeasePayment);
export default router;