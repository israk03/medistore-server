import { Request, Response, NextFunction } from 'express';
import * as AdminService from './admin.service';
import { sendResponse } from '../../utils/sendResponse';

// get dashboard stats
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await AdminService.getDashboardStats();
    sendResponse(res, 200, 'Dashboard stats fetched successfully', stats);
  } catch (err) {
    next(err);
  }
};



// GET ALL USERS
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.query.role as string | undefined;
    const users = await AdminService.getAllUsers(role);
    sendResponse(res, 200, 'Users fetched successfully', users);
  } catch (err) {
    next(err);
  }
};



// UPDATE USER STATUS
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isBanned } = req.body;

    if (typeof isBanned !== 'boolean') {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'isBanned must be true or false',
      });
      return;
    }

    const user = await AdminService.updateUserStatus(req.params.id as string, isBanned);
    sendResponse(res, 200, 'User status updated successfully', user);
  } catch (err) {
    next(err);
  }
};



// GET ALL ORDERS
export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const orders = await AdminService.getAllOrders(status);
    sendResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};



// GET ORDER BY ID
export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await AdminService.getOrderById(req.params.id as string);
    sendResponse(res, 200, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};