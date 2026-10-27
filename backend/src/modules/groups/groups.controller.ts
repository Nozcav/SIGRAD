import { RequestHandler } from "express";
import {
  createGroup,
  deleteGroup,
  listGroups,
  saveAssessment,
  saveGroupGrades,
  updateGroup,
} from "./groups.service";

export const list: RequestHandler = async (req, res, next) => {
  try {
    const groups = await listGroups(req.user!.id, req.params.formId);
    res.status(200).json({ groups });
  } catch (error) { next(error); }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const group = await createGroup(req.user!.id, req.params.formId, req.body);
    res.status(201).json({ group });
  } catch (error) { next(error); }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const group = await updateGroup(req.user!.id, req.params.groupId, req.body);
    res.status(200).json({ group });
  } catch (error) { next(error); }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    await deleteGroup(req.user!.id, req.params.groupId);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const saveRubric: RequestHandler = async (req, res, next) => {
  try {
    const criteria = await saveAssessment(req.user!.id, req.params.groupId, req.body);
    res.status(200).json({ criteria });
  } catch (error) { next(error); }
};

export const saveGrades: RequestHandler = async (req, res, next) => {
  try {
    await saveGroupGrades(req.user!.id, req.params.groupId, req.body);
    res.status(204).send();
  } catch (error) { next(error); }
};