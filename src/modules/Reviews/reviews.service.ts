import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { OrderStatus } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────────

interface AddReviewInput {
  customerId: string;
  medicineId: string;
  rating: number;
  comment?: string;
}

// ── Services ──────────────────────────────────────────────────

// ADD REVIEW
export const addReview = async (input: AddReviewInput) => {
  const { customerId, medicineId, rating, comment } = input;

  // Check medicine exists
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });
  if (!medicine) throw new AppError('Medicine not found', 404);

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Check delivered order
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      customerId,
      status: OrderStatus.DELIVERED,
      orderItems: {
        some: { medicineId },
      },
    },
  });

  if (!deliveredOrder) {
    throw new AppError(
      'You can only review medicines from delivered orders',
      403
    );
  }

  // Check duplicate review
  const existingReview = await prisma.review.findFirst({
    where: { customerId, medicineId },
  });

  if (existingReview) {
    throw new AppError('You already reviewed this medicine', 409);
  }

  return await prisma.review.create({
    data: {
      customerId,
      medicineId,
      rating,
      comment,
    },
    include: {
      customer: {
        select: { id: true, name: true },
      },
    },
  });
};

// GET REVIEWS
export const getMedicineReviews = async (medicineId: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) throw new AppError('Medicine not found', 404);

  const reviews = await prisma.review.findMany({
    where: { medicineId },
    include: {
      customer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    totalReviews: reviews.length,
    avgRating: Number(avgRating.toFixed(1)),
  };
};

// DELETE REVIEW
export const deleteReview = async (reviewId: string, customerId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw new AppError('Review not found', 404);

  if (review.customerId !== customerId) {
    throw new AppError('Forbidden: you did not write this review', 403);
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });
};