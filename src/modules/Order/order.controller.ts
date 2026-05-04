import { Request, Response, NextFunction } from 'express';
import * as OrderService from './order.service';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';

// CREATE ORDER
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shippingAddress, items } = req.body;

    if (!shippingAddress || !Array.isArray(items) || items.length === 0) {
      throw new AppError('shippingAddress and valid items are required', 400);
    }

    const order = await OrderService.createOrder({
      customerId: req.user!.id,
      shippingAddress,
      items,
    });

    sendResponse(res, 201, 'Order placed successfully', order);
  } catch (err) {
    next(err);
  }
};

// GET MY ORDERS
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await OrderService.getMyOrders(req.user!.id);

    sendResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};

// GET ORDER BY ID
export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await OrderService.getOrderById(
      req.params.id,
      req.user!.id
    );

    sendResponse(res, 200, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

// CANCEL ORDER
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await OrderService.cancelOrder(
      req.params.id as string,
      req.user!.id
    );

    sendResponse(res, 200, 'Order cancelled successfully', order);
  } catch (err) {
    next(err);
  }
};