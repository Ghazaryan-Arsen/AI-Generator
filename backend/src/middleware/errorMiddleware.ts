import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Backend Error:`, err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  const response: ApiResponse<null> = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? message : `${message} - ${err.stack}`
  };

  res.status(status).json(response);
};
