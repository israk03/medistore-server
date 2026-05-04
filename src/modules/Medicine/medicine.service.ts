import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';

// ── Types ──────────────────────────────────────────────────────────────────

interface GetMedicinesQuery {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

// ── Services ───────────────────────────────────────────────────────────────

// GET ALL MEDICINES
export const getAllMedicines = async (query: GetMedicinesQuery) => {
  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    page = '1',
    limit = '12',
  } = query;

  // Pagination setup
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.max(parseInt(limit) || 12, 1);
  const skip = (pageNum - 1) * limitNum;

  // Dynamic filter
  const where: any = {
    isActive: true,
    stock: { gt: 0 },

    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),

    ...(categoryId && { categoryId }),

    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
  };

  const [medicines, total] = await prisma.$transaction([
    prisma.medicine.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },

      include: {
        category: {
          select: { id: true, name: true },
        },
        seller: {
          select: { id: true, name: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
    }),

    prisma.medicine.count({ where }),
  ]);

  return {
    medicines,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// GET SINGLE MEDICINE
export const getMedicineById = async (id: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },

    include: {
      category: {
        select: { id: true, name: true },
      },
      seller: {
        select: { id: true, name: true },
      },
      reviews: {
        include: {
          customer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404);
  }

  // Calculate average rating
  const avgRating =
    medicine.reviews.length > 0
      ? medicine.reviews.reduce((sum, r) => sum + r.rating, 0) /
        medicine.reviews.length
      : 0;

  return {
    ...medicine,
    avgRating: Number(avgRating.toFixed(1)),
  };
};