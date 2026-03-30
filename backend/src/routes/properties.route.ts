
import { Router } from "express";
import { createProperty, getProperties, getPropertyById, getPropertyLeases } from "../controllers/properties.controller.js";
import multer from 'multer';
import { authMiddleware } from "../middlewares/auth.middleware.js";
const storage = multer.memoryStorage();

const upload = multer({storage});

const router = Router();


router.route('/').get(getProperties);
router.route('/:id').get(getPropertyById);
router.route('/').post(authMiddleware(['manager']),upload.array('files'),createProperty);
router.route('/:id/leases').get(authMiddleware(['manager']),getPropertyLeases);
export default router;