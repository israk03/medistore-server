import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';

// TYPES
interface OrderItemInput {
  medicineId: string;
  quantity: number;
}

interface CreateOrderInput {
  customerId: string;
  shippingAddress: Record<string, any>;
  items: OrderItemInput[];
}

// SHARED INCLUDE
const orderInclude = {
  orderItems: {
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          manufacturer: true,
        },
      },
    },
  },
  customer: {
    select: { id: true, name: true, email: true },
  },
};

// CREATE ORDER
export const createOrder = async (input: CreateOrderInput) => {
  const { customerId, shippingAddress, items } = input;

  if (!items.length) {
    throw new AppError('Order must contain at least one item', 400);
  }

  const medicineIds = items.map((item) => item.medicineId);

  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
  });

  if (medicines.length !== medicineIds.length) {
    throw new AppError('One or more medicines not found', 404);
  }

  const medicineMap = new Map(medicines.map((m) => [m.id, m]));

  for (const item of items) {
    const medicine = medicineMap.get(item.medicineId)!;

    if (item.quantity <= 0) {
      throw new AppError(`Invalid quantity for ${medicine.name}`, 400);
    }

    if (medicine.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${medicine.name}"`,
        400
      );
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const medicine = medicineMap.get(item.medicineId)!;
    return sum + Number(medicine.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId,
        shippingAddress,
        totalAmount,
        status: 'PLACED',
        orderItems: {
          create: items.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: medicineMap.get(item.medicineId)!.price,
          })),
        },
      },
      include: orderInclude,
    });

    for (const item of items) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return newOrder;
  });

  return order;
};

// GET MY ORDERS
export const getMyOrders = async (customerId: string) => {
  return prisma.order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
};

// GET ORDER BY ID
export const getOrderById = async (orderId: string, customerId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) throw new AppError('Order not found', 404);

  if (order.customerId !== customerId) {
    throw new AppError('Forbidden', 403);
  }

  return order;
};

// CANCEL ORDER
export const cancelOrder = async (orderId: string, customerId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) throw new AppError('Order not found', 404);

  if (order.customerId !== customerId) {
    throw new AppError('Forbidden', 403);
  }

  if (order.status !== 'PLACED') {
    throw new AppError('Only PLACED orders can be cancelled', 400);
  }

  return prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: orderInclude,
    });

    for (const item of order.orderItems) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: { increment: item.quantity },
        },
      });
    }

    return cancelled;
  });
};