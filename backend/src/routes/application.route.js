import {Router} from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createApplication, getApplicationByPropertyId, listApplication, updateApplicationStatus } from '../controllers/application.controller.js';

const router = Router();
router.route('/').post(authMiddleware(['tenant']),createApplication)
router.route('/').get(authMiddleware(['tenant','manager']), listApplication)
router.route('/:id').put(authMiddleware(['manager']), updateApplicationStatus)
router.route('/:propertyId').get(authMiddleware(['tenant']), getApplicationByPropertyId)
export default router;