import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { OrderStatus } from '@prisma/client';

interface MedicineInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  manufacturer: string;
  categoryId: string;
}

// Allowed transitions
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const medicineInclude = {
  category: { select: { id: true, name: true } },
  _count: { select: { reviews: true, orderItems: true } },
};

// GET SELLER MEDICINES
export const getMyMedicines = async (sellerId: string) => {
  return prisma.medicine.findMany({
    where: { sellerId },
    include: medicineInclude,
    orderBy: { createdAt: 'desc' },
  });
};

// ADD MEDICINE
export const addMedicine = async (sellerId: string, data: MedicineInput) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) throw new AppError('Category not found', 404);
  if (data.price <= 0) throw new AppError('Invalid price', 400);
  if (data.stock < 0) throw new AppError('Invalid stock', 400);

  return prisma.medicine.create({
    data: { ...data, sellerId },
    include: medicineInclude,
  });
};

// UPDATE MEDICINE
export const updateMedicine = async (
  medicineId: string,
  sellerId: string,
  data: Partial<MedicineInput>
) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) throw new AppError('Medicine not found', 404);

  if (medicine.sellerId !== sellerId) {
    throw new AppError('Forbidden', 403);
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new AppError('Category not found', 404);
  }

  return prisma.medicine.update({
    where: { id: medicineId },
    data,
    include: medicineInclude,
  });
};

// DELETE MEDICINE
export const deleteMedicine = async (medicineId: string, sellerId: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) throw new AppError('Medicine not found', 404);

  if (medicine.sellerId !== sellerId) {
    throw new AppError('Forbidden', 403);
  }

  const activeOrder = await prisma.orderItem.findFirst({
    where: {
      medicineId,
      order: {
        status: { in: ['PLACED', 'PROCESSING', 'SHIPPED'] },
      },
    },
  });

  if (activeOrder) {
    throw new AppError('Cannot delete medicine with active orders', 400);
  }

  await prisma.medicine.delete({ where: { id: medicineId } });
};

// GET SELLER ORDERS
export const getSellerOrders = async (sellerId: string) => {
  return prisma.order.findMany({
    where: {
      orderItems: {
        some: { medicine: { sellerId } },
      },
    },
    include: {
      orderItems: {
        where: { medicine: { sellerId } },
        include: {
          medicine: {
            select: { id: true, name: true, price: true },
          },
        },
      },
      customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (
  orderId: string,
  sellerId: string,
  newStatus: OrderStatus
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: { medicine: { select: { sellerId: true } } },
      },
    },
  });

  if (!order) throw new AppError('Order not found', 404);

  const ownsItem = order.orderItems.some(
    (item) => item.medicine.sellerId === sellerId
  );

  if (!ownsItem) throw new AppError('Forbidden', 403);

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status];

  if (!allowedNext.includes(newStatus)) {
    throw new AppError('Invalid status transition', 400);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};