/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export interface TAddOnItem {
  title: string;
  price: number;
}

export interface TOrder {
  _id: Types.ObjectId;

  menuId: Types.ObjectId;

  instructions?: string;
  refId?: string;

  addOnItems?: TAddOnItem[];

  totalAmount: number;

  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";

  customerName: string;

  customerPhone: string;

  pickUpTime: string;
}