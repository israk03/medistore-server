import { Request, Response, NextFunction } from 'express';
import * as MedicineService from './medicine.service';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';

// GET ALL MEDICINES
export const getAllMedicines = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await MedicineService.getAllMedicines(
      req.query as any
    );

    sendResponse(res, 200, 'Medicines fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

// GET SINGLE MEDICINE
export const getMedicineById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new AppError('Medicine ID is required', 400);
    }

    const medicine = await MedicineService.getMedicineById(id);

    sendResponse(res, 200, 'Medicine fetched successfully', medicine);
  } catch (err) {
    next(err);
  }
};