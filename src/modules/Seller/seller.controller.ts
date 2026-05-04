import { Request, Response, NextFunction } from 'express';
import * as SellerService from './seller.service';
import { sendResponse } from '../../utils/sendResponse';
import { OrderStatus } from '@prisma/client';


// get my medicines
export const getMyMedicines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medicines = await SellerService.getMyMedicines(req.user!.id);
    sendResponse(res, 200, 'Medicines fetched successfully', medicines);
  } catch (err) {
    next(err);
  }
};



// add medicine
export const addMedicine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, stock, imageUrl, manufacturer, categoryId } = req.body;

    if (!name || !description || !price || stock === undefined || !manufacturer || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    const medicine = await SellerService.addMedicine(req.user!.id, {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      imageUrl,
      manufacturer,
      categoryId,
    });

    sendResponse(res, 201, 'Medicine added successfully', medicine);
  } catch (err) {
    next(err);
  }
};



// update medicine
export const updateMedicine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medicine = await SellerService.updateMedicine(
      req.params.id as string,
      req.user!.id,
      req.body
    );

    sendResponse(res, 200, 'Medicine updated successfully', medicine);
  } catch (err) {
    next(err);
  }
};



// delete medicine
export const deleteMedicine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await SellerService.deleteMedicine(req.params.id as string, req.user!.id);
    sendResponse(res, 200, 'Medicine deleted successfully');
  } catch (err) {
    next(err);
  }
};


// get seller orders
export const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await SellerService.getSellerOrders(req.user!.id);
    sendResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};



// update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    const validStatuses: OrderStatus[] = [
      'PLACED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status as OrderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    const order = await SellerService.updateOrderStatus(
      req.params.id as string,
      req.user!.id,
      status as OrderStatus
    );

    sendResponse(res, 200, 'Order status updated successfully', order);
  } catch (err) {
    next(err);
  }
};