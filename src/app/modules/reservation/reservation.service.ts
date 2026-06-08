import httpStatus from "http-status";

import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { ReservationSearchableFields } from "./reservation.constant";
import { Reservation } from "./reservation.model";
import { TReservation } from "./reservation.interface";
import { Table } from "../table/table.model";
import mongoose from "mongoose";

const getReservationFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Reservation.find().populate('tableId'), query)
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
  const result = await Reservation.findById(id).populate('tableId');
  return result;
};

const createReservationIntoDB = async (payload: TReservation) => {
  try {
    const result = await Reservation.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createReservationIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Reservation"
    );
  }
};

const updateReservationIntoDB = async (
  id: string,
  payload: Partial<TReservation>
) => {
  // Start the transaction session early so all reads and writes are isolated
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the reservation inside the session
    const reservation = await Reservation.findById(id).session(session);

    if (!reservation) {
      throw new AppError(httpStatus.NOT_FOUND, "Reservation not found");
    }

    // 1. Handle Table Swapping / Changing
    // If a new tableId is provided, and it's different from the currently assigned one
    if (payload.tableId && reservation.tableId && payload.tableId.toString() !== reservation.tableId.toString()) {
      // Re-activate the old table
      await Table.findByIdAndUpdate(
        reservation.tableId,
        { status: "active" },
        { session, runValidators: true }
      );
    }

    // 2. If status is changing to 'confirmed', mark the target table as busy ('inactive')
    if (payload.status === "confirmed" && (payload.tableId || reservation.tableId)) {
      const targetTableId = payload.tableId || reservation.tableId;
      
      await Table.findByIdAndUpdate(
        targetTableId,
        { status: "inactive" }, 
        { session, runValidators: true }
      );
    }

    // 3. If status changes to 'completed' or 'cancelled', free up the assigned table
    if (payload.status === "completed" || payload.status === "cancelled") {
      // Always look at the original tableId or the newly requested payload tableId
      const targetTableId = payload.tableId || reservation.tableId;
      
      if (targetTableId) {
        await Table.findByIdAndUpdate(
          targetTableId,
          { status: "active" },
          { session, runValidators: true }
        );
      }
    }

    // 4. Apply the actual reservation update
    const result = await Reservation.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });

    // Commit all changes safely
    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    // Abort transaction on any failures
    await session.abortTransaction();
    session.endSession();
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
