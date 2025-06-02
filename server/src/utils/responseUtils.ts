import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): void => {
  res.status(statusCode).json(data);
};

export const sendPaginatedSuccess = <T>(res: Response, data: T[], total: number, page: number, limit: number, totalPages: number, statusCode = 200): void => {
  res.status(statusCode).json({
    items: data,
    total,
    page,
    limit,
    totalPages
  });
};

export const sendError = (res: Response, message: string, statusCode = 500): void => {
  res.status(statusCode).json({
    success: false,
    message
  });
};


export const sendAIResponse = <T>(res: Response, text: string, functionResponses: T, statusCode = 200): void => {   
  res.status(statusCode).json({
    success: true,
    text,
    functionResponses,
  });
};