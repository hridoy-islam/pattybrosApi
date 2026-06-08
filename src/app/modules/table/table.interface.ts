/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export interface TTable {
 tableNumber: string; 
  capacity: number;  
  location?: string;   
  status: "active" | "maintenance";
}
