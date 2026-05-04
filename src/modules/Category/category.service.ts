import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';

// GET ALL CATEGORIES
export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { medicines: true },
      },
    },
  });

  // Optional cleaner response
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    createdAt: cat.createdAt,
    medicineCount: cat._count.medicines,
  }));
};

// CREATE CATEGORY
export const createCategory = async (name: string) => {
  // Case-insensitive check
  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    throw new AppError('Category already exists', 409);
  }

  return await prisma.category.create({
    data: { name },
  });
};

// DELETE CATEGORY
export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const medicineCount = await prisma.medicine.count({
    where: { categoryId: id },
  });

  if (medicineCount > 0) {
    throw new AppError(
      'Cannot delete category with existing medicines',
      400
    );
  }

  await prisma.category.delete({
    where: { id },
  });
};