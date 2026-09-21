import { RequestHandler } from "express";
import { addComment } from "./comments.service";

export const create: RequestHandler = async (req, res, next) => {
  try {
    const comment = await addComment(req.user!.id, req.params.responseId, req.body);
    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};
