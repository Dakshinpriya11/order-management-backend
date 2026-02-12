import { Request, Response } from "express";
import * as service from "./menu.service";
import { createMenuItemSchema } from "./menu.validation";
import { ZodError } from "zod";
import { AppError } from "../../errors/appError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { HTTP_STATUS } from "../../errors/httpStatus";

/**
 * Get all menu items
 */
export const getMenuItems = async (req: Request, res: Response) => {
  const items = await service.getAllMenuItems();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: items,
  });
};

/**
 * Create menu item
 */
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const parsed = createMenuItemSchema.parse(req.body);
    const item = await service.createMenuItem(parsed);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: item });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        code: ERROR_CODES.MENU_INVALID_INPUT,
        message: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
      });
    }
    throw err;
  }
};
