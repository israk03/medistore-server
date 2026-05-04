import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/AppError';
import { Role, OrderStatus } from '@prisma/client';

// ── Shared include ─────────────────────────────────────────────

const orderInclude = {
  orderItems: {
    include: {
      medicine: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  },
  customer: { select: { id: true, name: true, email: true } },
};

// ── SERVICES ───────────────────────────────────────────────────

// GET USERS
export const getAllUsers = async (role?: string) => {
  let roleFilter: Role | undefined;

  if (role && role !== 'ALL') {
    if (!Object.values(Role).includes(role as Role)) {
      throw new AppError('Invalid role filter', 400);
    }
    roleFilter = role as Role;
  }

  return await prisma.user.findMany({
    where: {
      role: { not: Role.ADMIN },
      ...(roleFilter ? { role: roleFilter } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          medicines: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};




// UPDATE USER STATUS
export const updateUserStatus = async (userId: string, isBanned: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new AppError('User not found', 404);

  if (user.role === Role.ADMIN) {
    throw new AppError('Cannot modify admin account', 403);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });
};




// GET ALL ORDERS
export const getAllOrders = async (status?: string) => {
  let statusFilter: OrderStatus | undefined;

  if (status && status !== 'ALL') {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new AppError('Invalid order status', 400);
    }
    statusFilter = status as OrderStatus;
  }

  return await prisma.order.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
};




// GET SINGLE ORDER
export const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order) throw new AppError('Order not found', 404);

  return order;
};




// DASHBOARD STATS
export const getDashboardStats = async () => {
  const [
    totalCustomers,
    totalSellers,
    totalMedicines,
    totalOrders,
    placedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    revenueData,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.user.count({ where: { role: Role.SELLER } }),
    prisma.medicine.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PLACED } }),
    prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
    prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    prisma.order.aggregate({
      where: { status: OrderStatus.DELIVERED },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    users: {
      customers: totalCustomers,
      sellers: totalSellers,
      total: totalCustomers + totalSellers,
    },
    medicines: totalMedicines,
    orders: {
      total: totalOrders,
      byStatus: {
        placed: placedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
    },
    revenue: {
      total: Number(revenueData._sum.totalAmount || 0),
    },
  };
};