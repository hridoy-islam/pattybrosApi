import { Schema, model } from "mongoose";
import { TOrder,TAddOnItem } from "./order.interface";


const addOnSchema = new Schema<TAddOnItem>(
  {
    title: { 
      type: String, 
    },
    price: { 
      type: Number 
    },
    

  },
);

const OrderSchema = new Schema<TOrder>(
  {
  

    menuId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    instructions: {
      type:String,
    },
    refId:{type:String},
    addOnItems: { type: [addOnSchema] },
    totalAmount:{ type: Number ,required:true},
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
       customerName:{
      type: String,
      required:true
    },

    customerPhone:{
      type: String,
      required:true
    },

    pickUpTime:{
      type: String,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

export const Order = model<TOrder>("Order", OrderSchema);