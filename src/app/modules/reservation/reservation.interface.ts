/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export interface TReservation {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  reservationDate: Date;
  preferredTime: string; // Stored as "HH:mm"
  tableId?: Types.ObjectId; // Optional until the admin assigns it
  startTime?: string; // Optional until the admin confirms
  endTime?: string; // Optional until the admin confirms
  status: "pending" | "confirmed" | "completed" | "cancelled";
}
