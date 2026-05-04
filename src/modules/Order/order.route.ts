import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from './order.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Customer only
router.post('/', authorize(Role.CUSTOMER), createOrder);
router.get('/', authorize(Role.CUSTOMER), getMyOrders);
router.get('/:id', authorize(Role.CUSTOMER), getOrderById);
router.patch('/:id/cancel', authorize(Role.CUSTOMER), cancelOrder);

export default router;
export const OrderRoutes = router;