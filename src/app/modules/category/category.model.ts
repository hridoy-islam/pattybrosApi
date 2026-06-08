/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";

import { TCategory } from "./category.interface";

const CategorySchema = new Schema<TCategory>(
  {
    CategoryName: {
      type: String,
      required: true,
    },
    
  },
  {
    timestamps: true,
  },
);

export const Category = model<TCategory>("Category", CategorySchema);
