import { Router } from 'express';
import {
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getMyMedicines,
  getSellerOrders,
  updateOrderStatus,
} from './seller.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate, authorize('SELLER'));

// Inventory
router.get('/medicines', getMyMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// Orders
router.get('/orders', getSellerOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
export const SellerRoutes = router;