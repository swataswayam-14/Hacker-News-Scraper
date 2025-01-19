import { ApiError } from './errorHandler.js';

export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1) {
    throw new ApiError(400, 'Invalid pagination parameters');
  }

  req.pagination = { page, limit };
  next();
};

export const validateTimeRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && !Date.parse(startDate)) {
    throw new ApiError(400, 'Invalid start date format');
  }
  
  if (endDate && !Date.parse(endDate)) {
    throw new ApiError(400, 'Invalid end date format');
  }

  next();
};
