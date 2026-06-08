/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export interface TAddOnItem {
  title: string;
  price: number;
}

export interface TMenu {
  _id: Types.ObjectId;
  title: string;
  ingredientItem: string[];
  price: number;
  categoryId: Types.ObjectId;
  addOnItems: TAddOnItem[];
  image: string;
  status: string;
}
