import { Request, Response, NextFunction, RequestHandler } from "express";
//  Request, Response, NextFunction these are in-built types in express and RequestHandler is a type that define structure of a function
function asyncHandler<T>(
  reqHandler: (req: Request, res: Response, next: NextFunction) => Promise<T>
): RequestHandler {
  // RequestHandler is a type that define structure of a function
  return (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
  };
}

export { asyncHandler };
