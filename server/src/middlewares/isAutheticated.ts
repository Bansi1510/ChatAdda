import { NextFunction, Request, Response } from "express";
import response from "../utils/responseHandler";
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const isAuthicated = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const token = req.cookies.auth_token;
    console.log(token);
    if (!token) {
      return response(res, 401, 'you are not autheticated');
    }
    const secret = process.env.JWT as string
    const decoded = jwt.verify(token, secret) as { userId: string };

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.log(error);
    return response(res, 500, 'internal server error');
  }
}
export default isAuthicated;