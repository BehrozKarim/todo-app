import { Request, Response, NextFunction  } from "express";
import logger from "../../src/infra/logger";

interface ErrorResponse {
    message: string;
    error: string;
    statusCode: number;
  }

  
const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void = (
    err,
    req,
    res,
    next,
  ) => {
    logger.error(err.message);
  
    const errorResponse: ErrorResponse = {
      message: err.message,
      error: err.name,
      statusCode: err.name === 'DTOValidationError' ? 400 : 500,
    };
  
    res.status(errorResponse.statusCode).json(errorResponse);
  };
  
  export default errorHandler;