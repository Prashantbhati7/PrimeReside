import { Router } from "express";
import { createManager, getManagerById, getManagerProperties, updatemanager } from "../controllers/manager.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();


router.route('/').post(createManager)
router.route('/:authId').get(getManagerById)

router.route('/').put(authMiddleware(['manager']),updatemanager);
router.route('/:authId/properties').get(getManagerProperties);
export default router;