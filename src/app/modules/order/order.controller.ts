import { RequestHandler } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderServices } from "./order.service";
import AppError from "../../errors/AppError";

const getAllOrder: RequestHandler = catchAsync(async (req, res) => {
  const result = await OrderServices.getOrderFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrived succesfully",
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderServices.getSingleOrderFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order is retrieved succesfully",
    data: result,
  });
});

const getTopOrderedMenuItems = catchAsync(async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!year || !month || month < 1 || month > 12) {
    throw new AppError(httpStatus.BAD_REQUEST, "Valid year and month (1–12) are required");
  }

  const result = await OrderServices.getTopOrderedMenuItemsByMonth(year, month);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top ordered menu items fetched successfully",
    data: result,
  });
});

const updateOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderServices.updateOrderIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order is updated succesfully",
    data: result,
  });
});
const deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderServices.deleteOrderFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order is deleted succesfully",
    data: result,
  });
});

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.createOrderIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order Created succesfully",
    data: result,
  });
});

export const OrderControllers = {
  getAllOrder,
  createOrder,
  updateOrder,
  getSingleOrder,
  deleteOrder,
  getTopOrderedMenuItems
};
