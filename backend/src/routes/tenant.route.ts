import {Router} from 'express';
import { createTenant, getALLTenants, getCurrResidence, getTenantById, removeFavorite, ToggleFavorite, updateTenant } from '../controllers/tenants.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').get(getALLTenants);
router.route('/:authId').get(getTenantById);
router.route('/').post(createTenant);
router.route('/').put(authMiddleware(['tenant']),updateTenant);
router.route('/:authId/residence').get(getCurrResidence);
router.route('/favorites/:propertyId').post(authMiddleware(['tenant']),ToggleFavorite);
router.route('/favorites/:propertyId').delete(authMiddleware(['tenant']),removeFavorite)
export default router;