import { Router } from 'express';
import {
  getAllMedicines,
  getMedicineById,
} from './medicine.controller';

const router = Router();

// Public routes
router.get('/', getAllMedicines);
router.get('/:id', getMedicineById);

export default router;
export const MedicineRoutes = router;