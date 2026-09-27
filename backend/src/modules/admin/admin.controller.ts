import { RequestHandler } from "express";
import { createUser, listUsers, updateUserRole, updateUserStatus } from "./admin.service";

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const changeRole: RequestHandler = async (req, res, next) => {
  try {
    const user = await updateUserRole(req.user!.id, req.params.id, req.body.role);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const changeStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = await updateUserStatus(req.user!.id, req.params.id, req.body.active);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const { user, temporaryPassword } = await createUser(req.body);
    res.status(201).json({ user, temporaryPassword });
  } catch (error) {
    next(error);
  }
};
