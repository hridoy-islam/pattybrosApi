import { RequestHandler } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TableServices } from "./table.service";

const getAllTable: RequestHandler = catchAsync(async (req, res) => {
  const result = await TableServices.getTableFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Table retrived succesfully",
    data: result,
  });
});

const getSingleTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TableServices.getSingleTableFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Table is retrieved succesfully",
    data: result,
  });
});

const updateTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TableServices.updateTableIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Table is updated succesfully",
    data: result,
  });
});
const deleteTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TableServices.deleteTableFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Table is deleted succesfully",
    data: result,
  });
});

const createTable = catchAsync(async (req, res) => {
  const result = await TableServices.createTableIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Table Created succesfully",
    data: result,
  });
});

export const TableControllers = {
  getAllTable,
  createTable,
  updateTable,
  getSingleTable,
  deleteTable,
};
