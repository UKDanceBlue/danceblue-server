import { RequestHandler } from "express";
import createHttpError from "http-errors";

export const NYI: RequestHandler = (req, res, next) => {
  return next(createHttpError.NotImplemented());
};
