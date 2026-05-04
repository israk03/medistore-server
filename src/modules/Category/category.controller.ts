import { Request, Response, NextFunction } from 'express';
import * as CategoryService from './category.service';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';

// GET ALL CATEGORIES
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await CategoryService.getAllCategories();

    sendResponse(res, 200, 'Categories fetched successfully', categories);
  } catch (err) {
    next(err);
  }
};

// CREATE CATEGORY
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { name } = req.body;

    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    name = name.trim();

    const category = await CategoryService.createCategory(name);

    sendResponse(res, 201, 'Category created successfully', category);
  } catch (err) {
    next(err);
  }
};

// DELETE CATEGORY
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await CategoryService.deleteCategory(req.params.id as string);

    sendResponse(res, 200, 'Category deleted successfully', null);
  } catch (err) {
    next(err);
  }
};