import { Router } from 'express';
import {
  addReview,
  getMedicineReviews,
  deleteReview,
} from './reviews.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/medicine/:medicineId', getMedicineReviews);

// Customer only
router.post('/medicine/:medicineId', authenticate, authorize('CUSTOMER'), addReview);
router.delete('/:id', authenticate, authorize('CUSTOMER'), deleteReview);

export default router;

export const ReviewsRoutes = router;
