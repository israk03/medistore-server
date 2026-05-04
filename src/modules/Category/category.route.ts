import { Router } from 'express';
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from './category.controller';

import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public
router.get('/', getAllCategories);

// Admin only
router.post('/', authenticate, authorize(Role.ADMIN), createCategory);
router.delete('/:id', authenticate, authorize(Role.ADMIN), deleteCategory);

export const CategoryRoutes = router;
export default router;