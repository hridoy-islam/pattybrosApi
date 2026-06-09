import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { ReservationSearchableFields } from "./reservation.constant";
import { Reservation } from "./reservation.model";
import { TReservation } from "./reservation.interface";
import { Table } from "../table/table.model";
import mongoose from "mongoose";
import { sendEmail } from "../../utils/sendEmail";
import { sendEmailAdmin } from "../../utils/sendEmailAdmin";

const getReservationFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Reservation.find(), query)
    .search(ReservationSearchableFields)
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

const getSingleReservationFromDB = async (id: string) => {
  const result = await Reservation.findById(id);
  return result;
};

const createReservationIntoDB = async (payload: TReservation) => {
  try {
    // 1. Save reservation entry into database
    const result = await Reservation.create(payload);

    // 2. Dispatch notifications to Customer and Admin safely
    try {
      const adminEmail = "info@patty-bros.co.uk";

      await Promise.all([
        // Send Thank You / Status Alert to customer (No mention of a table layout)
        sendEmail(
          result.customerEmail,
          "reservation_request", 
          `Reservation Request Received - Patty Bro's`,
          result.customerName,
          `Thank you for your reservation request! We will update you as soon as your booking is confirmed.`,
          result,
        ),

        // Send Alert notification directly to Admin
        sendEmailAdmin(
          adminEmail,
          "admin_reservation_notification", 
          `New Pending Reservation - ${result.customerName} (${result.partySize} Guests)`,
          result.customerName,
          `A new reservation request needs review.`,
          result,
        ),
      ]);
    } catch (emailError) {
      console.error("Reservation notification dispatch failed:", emailError);
    }

    return result;
  } catch (error: any) {
    console.error("Error in createReservationIntoDB:", error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Reservation",
    );
  }
};



const updateReservationIntoDB = async (
  id: string,
  payload: Partial<TReservation>
) => {
  try {
    // 1. Fetch the reservation to evaluate the status before applying updates
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      throw new AppError(httpStatus.NOT_FOUND, "Reservation not found");
    }

    // 2. Apply the actual reservation update
    const result = await Reservation.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update reservation");
    }

    // 3. Status Transition Emails
    try {
      // If changed to 'confirmed' and wasn't confirmed already
      if (payload.status === "confirmed" && reservation.status !== "confirmed") {
        await sendEmail(
          result.customerEmail,
          "reservation_confirmed", // Points to your confirmed EJS file name
          "Your Reservation is Confirmed! - Patty Bro's",
          result.customerName,
          "Great news! Your booking has been officially confirmed.",
          result
        );
      }

      // If changed to 'cancelled' and wasn't cancelled already
      if (payload.status === "cancelled" && reservation.status !== "cancelled") {
        await sendEmail(
          result.customerEmail,
          "reservation_cancelled", // Points to your cancelled EJS file name
          "Reservation Cancellation - Patty Bro's",
          result.customerName,
          "Your reservation request has been cancelled.",
          result
        );
      }
    } catch (emailError) {
      // Log mailing issues safely to avoid aborting the database transaction response
      console.error("Status update email delivery failed:", emailError);
    }

    return result;
  } catch (error) {
    throw error;
  }
};


const deleteReservationFromDB = async (
  id: string,
) => {
  const reservation = await Reservation.findById(id);

  if (!reservation) {
    throw new AppError(httpStatus.NOT_FOUND, "Reservation not found");
  }


  const result = await Reservation.findByIdAndDelete(id);

  return result;
};

export const ReservationServices = {
  createReservationIntoDB,
  getReservationFromDB,
  updateReservationIntoDB,
  getSingleReservationFromDB,
  deleteReservationFromDB
};
