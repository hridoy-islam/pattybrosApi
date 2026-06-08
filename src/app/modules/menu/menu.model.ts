import { Schema, model } from "mongoose";
import { TAddOnItem, TMenu } from "./menu.interface";



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



const MenuSchema = new Schema<TMenu>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    ingredientItem: {
      type: [String],
      default: [],
    },

    addOnItems:{ type: [addOnSchema] },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image:{
      type: String,
    },
    status:{
      type: String,
      enum:["active","inactive"],
      default:"active"
    }
  },
  {
    timestamps: true,
  }
);

export const Menu = model<TMenu>("Menu", MenuSchema);