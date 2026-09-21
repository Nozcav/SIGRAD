import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

export const validateBody = (schema: ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
