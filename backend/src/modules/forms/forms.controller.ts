import { RequestHandler } from "express";
import {
  archiveForm,
  createForm,
  getFormByCodeForStudent,
  getFormForTeacher,
  listFormsByTeacher,
  updateForm,
  updateFormStatus,
} from "./forms.service";

export const create: RequestHandler = async (req, res, next) => {
  try {
    const form = await createForm(req.user!.id, req.body);
    res.status(201).json({ form });
  } catch (error) {
    next(error);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const forms = await listFormsByTeacher(req.user!.id);
    res.status(200).json({ forms });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const form = await getFormForTeacher(req.user!.id, req.params.id);
    res.status(200).json({ form });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const form = await updateForm(req.user!.id, req.params.id, req.body);
    res.status(200).json({ form });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const form = await archiveForm(req.user!.id, req.params.id);
    res.status(200).json({ message: "Formulario archivado", form });
  } catch (error) {
    next(error);
  }
};

export const changeStatus: RequestHandler = async (req, res, next) => {
  try {
    const form = await updateFormStatus(req.user!.id, req.params.id, req.body.status);
    res.status(200).json({ form });
  } catch (error) {
    next(error);
  }
};

export const getByCode: RequestHandler = async (req, res, next) => {
  try {
    const form = await getFormByCodeForStudent(req.params.code);
    res.status(200).json({ form });
  } catch (error) {
    next(error);
  }
};
