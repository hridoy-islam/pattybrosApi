import { Schema, model } from "mongoose";
import { TOrder, TAddOnItem } from "./order.interface";

// ─── Add-On Schema ────────────────────────────────────────────────────────────
const addOnSchema = new Schema<TAddOnItem>({
  title: { 
    type: String, 
  },
  price: { 
    type: Number 
  },
});

// ─── Single Order Item Schema ──────────────────────────────────────────────────
// This groups menuId, instructions, quantity, and addOns together for each item.
const orderItemSchema = new Schema({
  menuId: {
    type: Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  instructions: {
    type: String,
  },
  addOnItems: { 
    type: [addOnSchema], 
    default: [] 
  },
});

// ─── Main Order Schema ─────────────────────────────────────────────────────────
const OrderSchema = new Schema<TOrder>(
  {
    items: {
      type: [orderItemSchema],
      required: true,
     
    },
    refId: { 
      type: String 
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    pickUpTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<TOrder>("Order", OrderSchema);