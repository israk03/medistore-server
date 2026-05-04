import { Router } from 'express';
import {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getOrderById,
  getDashboardStats,
} from './admin.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);

export default router;

export const AdminRoutes = router;
