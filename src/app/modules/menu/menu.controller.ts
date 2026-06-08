import { RequestHandler } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MenuServices } from "./menu.service";

const getAllMenu: RequestHandler = catchAsync(async (req, res) => {
  const result = await MenuServices.getMenuFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu retrived succesfully",
    data: result,
  });
});

const getSingleMenu = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MenuServices.getSingleMenuFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu is retrieved succesfully",
    data: result,
  });
});

const updateMenu = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MenuServices.updateMenuIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu is updated succesfully",
    data: result,
  });
});
const deleteMenu = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MenuServices.deleteMenuFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu is deleted succesfully",
    data: result,
  });
});

const createMenu = catchAsync(async (req, res) => {
  const result = await MenuServices.createMenuIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu Created succesfully",
    data: result,
  });
});

export const MenuControllers = {
  getAllMenu,
  createMenu,
  updateMenu,
  getSingleMenu,
  deleteMenu,
};
