import {Router} from 'express';
import { createTenant, getALLTenants, getCurrResidence, getTenantById, removeFavourite, ToggleFavourite, updateTenant } from '../controllers/tenants.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').get(getALLTenants);
router.route('/:authId').get(getTenantById);
router.route('/').post(createTenant);
router.route('/').put(authMiddleware(['tenant']),updateTenant);
router.route('/:authId/residence').get(getCurrResidence);
router.route('/favourites/:propertyId').post(authMiddleware(['tenant']),ToggleFavourite);
router.route('/favourites/:propertyId').delete(authMiddleware(['tenant']),removeFavourite)
export default router;