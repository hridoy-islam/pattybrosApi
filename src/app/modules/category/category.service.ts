import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { CategorySearchableFields } from "./category.constant";
import { Category } from "./category.model";
import { TCategory } from "./category.interface";

const getCategoryFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Category.find(), query)
    .search(CategorySearchableFields)
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

const getSingleCategoryFromDB = async (id: string) => {
  const result = await Category.findById(id);
  return result;
};

const createCategoryIntoDB = async (payload: TCategory) => {
  try {
    const result = await Category.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createCategoryIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Category"
    );
  }
};

const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<TCategory>
) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }


  // Update only the selected user
  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};


const deleteCategoryFromDB = async (
  id: string,
) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }


  const result = await Category.findByIdAndDelete(id);

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getCategoryFromDB,
  updateCategoryIntoDB,
  getSingleCategoryFromDB,
  deleteCategoryFromDB
};
