import { RequestHandler } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReservationServices } from "./reservation.service";

const getAllReservation: RequestHandler = catchAsync(async (req, res) => {
  const result = await ReservationServices.getReservationFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservation retrived succesfully",
    data: result,
  });
});

const getSingleReservation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReservationServices.getSingleReservationFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservation is retrieved succesfully",
    data: result,
  });
});

const updateReservation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReservationServices.updateReservationIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservation is updated succesfully",
    data: result,
  });
});
const deleteReservation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReservationServices.deleteReservationFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservation is deleted succesfully",
    data: result,
  });
});

const createReservation = catchAsync(async (req, res) => {
  const result = await ReservationServices.createReservationIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservation Created succesfully",
    data: result,
  });
});

export const ReservationControllers = {
  getAllReservation,
  createReservation,
  updateReservation,
  getSingleReservation,
  deleteReservation,
};
