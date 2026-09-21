import { CookieOptions, RequestHandler } from "express";
import { env } from "../../config/env";
import { cookieMaxAgeMs } from "../../utils/jwt";
import { changeUserPassword, loginUser, registerUser, updateUserProfile } from "./auth.service";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.cookie("token", token, { ...baseCookieOptions, maxAge: cookieMaxAgeMs });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.cookie("token", token, { ...baseCookieOptions, maxAge: cookieMaxAgeMs });
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie("token", baseCookieOptions);
  res.status(200).json({ message: "Sesion cerrada" });
};

export const me: RequestHandler = (req, res) => {
  res.status(200).json({ user: req.user });
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user!.id, req.body);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    await changeUserPassword(req.user!.id, req.body);
    res.status(200).json({ message: "Contrasena actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};
