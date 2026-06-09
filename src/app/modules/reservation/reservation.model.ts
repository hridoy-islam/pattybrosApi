/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";

import { TReservation } from "./reservation.interface";

const ReservationSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    partySize: { type: Number, required: true },
    reservationDate: { type: Date, required: true },
    preferredTime: { type: String, required: true }, // Store as string like "19:00"
    // tableId: { type: Schema.Types.ObjectId, ref: "Table" },
    startTime: { type: String },// Store as string like "19:00"
    endTime: { type: String },// Store as string like "19:00"
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);
export const Reservation = model<TReservation>(
  "Reservation",
  ReservationSchema,
);
