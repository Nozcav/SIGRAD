import { RequestHandler } from "express";
import {
  getMyResponses,
  getResponseDetail,
  getResponsesForForm,
  submitResponse,
  updateResponseStatus,
} from "./responses.service";

export const submit: RequestHandler = async (req, res, next) => {
  try {
    const response = await submitResponse(req.user!.id, req.body);
    res.status(201).json({ response });
  } catch (error) {
    next(error);
  }
};

export const myResponses: RequestHandler = async (req, res, next) => {
  try {
    const responses = await getMyResponses(req.user!.id);
    res.status(200).json({ responses });
  } catch (error) {
    next(error);
  }
};

export const responsesForForm: RequestHandler = async (req, res, next) => {
  try {
    const responses = await getResponsesForForm(req.user!.id, req.params.formId);
    res.status(200).json({ responses });
  } catch (error) {
    next(error);
  }
};

export const detail: RequestHandler = async (req, res, next) => {
  try {
    const response = await getResponseDetail(req.user!, req.params.id);
    res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
};

export const changeStatus: RequestHandler = async (req, res, next) => {
  try {
    const response = await updateResponseStatus(req.user!.id, req.params.responseId, req.body.status);
    res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
};
