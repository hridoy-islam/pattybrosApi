/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";

import { TTable } from "./table.interface";

const TableSchema = new Schema({
tableNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    capacity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
  
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    }
  },
  {
    timestamps: true,
  }
);
export const Table = model<TTable>("Table", TableSchema);
