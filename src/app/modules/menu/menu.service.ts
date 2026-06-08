import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { MenuSearchableFields } from "./menu.constant";
import { Menu } from "./menu.model";
import { TMenu } from "./menu.interface";

const getMenuFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Menu.find().populate('categoryId'), query)
    .search(MenuSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleMenuFromDB = async (id: string) => {
  const result = await Menu.findById(id).populate('categoryId');
  return result;
};

const createMenuIntoDB = async (payload: TMenu) => {
  try {
    const result = await Menu.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createMenuIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Menu"
    );
  }
};

const updateMenuIntoDB = async (
  id: string,
  payload: Partial<TMenu>
) => {
  const menu = await Menu.findById(id);

  if (!menu) {
    throw new AppError(httpStatus.NOT_FOUND, "Menu not found");
  }


  // Update only the selected user
  const result = await Menu.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};


const deleteMenuFromDB = async (
  id: string,
) => {
  const menu = await Menu.findById(id);

  if (!menu) {
    throw new AppError(httpStatus.NOT_FOUND, "Menu not found");
  }


  const result = await Menu.findByIdAndDelete(id);

  return result;
};

export const MenuServices = {
  createMenuIntoDB,
  getMenuFromDB,
  updateMenuIntoDB,
  getSingleMenuFromDB,
  deleteMenuFromDB
};
