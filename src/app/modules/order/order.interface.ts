/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export interface TAddOnItem {
  title: string;
  price: number;
}

export interface TOrderItem {
  menuId: Types.ObjectId;
  quantity: number;
  instructions?: string;
  addOnItems?: TAddOnItem[];
}

export interface TOrder {
  _id: Types.ObjectId;
  
  // Replaced individual menu fields with an array of ordered items
  items: TOrderItem[];

  refId?: string;
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";

  customerName: string;
  customerPhone: string;
  customerEmail: string;

  pickUpTime: string;
}