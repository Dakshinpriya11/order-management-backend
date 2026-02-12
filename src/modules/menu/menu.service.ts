import { MenuItem } from "../../database/models/menuItem.model";
import { AppError } from "../../errors/appError";
import { ERROR_CODES } from "../../errors/errorCodes";
import { HTTP_STATUS } from "../../errors/httpStatus";

export const getAllMenuItems = async () => {
  return await MenuItem.findAll();
};

export const createMenuItem = async (data: { name: string; description?: string; price: number }) => {
  const item = await MenuItem.create(data);
  return item;
};

export const getMenuItemById = async (id: string) => {
  const item = await MenuItem.findByPk(id);
  if (!item) {
    throw new AppError(ERROR_CODES.MENU_NOT_FOUND, "Menu item not found", HTTP_STATUS.NOT_FOUND);
  }
  return item;
};
