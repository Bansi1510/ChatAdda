import type { Response } from 'express';


const response = (res: Response, statusCode: number, message: string, data: object | null = null) => {
  if (!res) {
    console.error("Response object is null");
    return;
  }

  const ResponseObj = {
    status: statusCode < 400 ? 'success' : 'error',
    message,
    data
  }
  return res.status(statusCode).json(ResponseObj);
}

export default response;