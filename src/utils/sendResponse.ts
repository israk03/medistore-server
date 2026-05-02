import { Response } from 'express';

type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    statusCode,
    message,
    ...(data !== undefined && { data }),
  };
  res.status(statusCode).json(response);
};