import { Request, Response, NextFunction } from 'express';
import * as ReviewService from './reviews.service';
import { sendResponse } from '../../utils/sendResponse';


// add review
export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const { medicineId } = req.params;

    const parsedRating = Number(rating);

    if (!parsedRating || isNaN(parsedRating)) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Valid rating is required',
      });
      return;
    }

    const review = await ReviewService.addReview({
      customerId: req.user!.id,
      medicineId: (medicineId as string),
      rating: parsedRating,
      comment,
    });

    sendResponse(res, 201, 'Review added successfully', review);
  } catch (err) {
    next(err);
  }
};



// get reviews for a medicine
export const getMedicineReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await ReviewService.getMedicineReviews(req.params.medicineId as string);
    sendResponse(res, 200, 'Reviews fetched successfully', result);
  } catch (err) {
    next(err);
  }
};



// delete review
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await ReviewService.deleteReview(req.params.id as string, req.user!.id);
    sendResponse(res, 200, 'Review deleted successfully');
  } catch (err) {
    next(err);
  }
};