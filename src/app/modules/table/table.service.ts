import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { TableSearchableFields } from "./table.constant";
import { Table } from "./table.model";
import { TTable } from "./table.interface";

const getTableFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Table.find(), query)
    .search(TableSearchableFields)
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

const getSingleTableFromDB = async (id: string) => {
  const result = await Table.findById(id);
  return result;
};

const createTableIntoDB = async (payload: TTable) => {
  try {
    const result = await Table.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createTableIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Table"
    );
  }
};

const updateTableIntoDB = async (
  id: string,
  payload: Partial<TTable>
) => {
  const table = await Table.findById(id);

  if (!table) {
    throw new AppError(httpStatus.NOT_FOUND, "Table not found");
  }


  // Update only the selected user
  const result = await Table.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};


const deleteTableFromDB = async (
  id: string,
) => {
  const table = await Table.findById(id);

  if (!table) {
    throw new AppError(httpStatus.NOT_FOUND, "Table not found");
  }


  const result = await Table.findByIdAndDelete(id);

  return result;
};

export const TableServices = {
  createTableIntoDB,
  getTableFromDB,
  updateTableIntoDB,
  getSingleTableFromDB,
  deleteTableFromDB
};
