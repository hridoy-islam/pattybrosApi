/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";


import { OrderControllers } from "./order.controller";
import auth from "../../middlewares/auth";


const router = express.Router();
router.get(
  "/",
OrderControllers.getAllOrder
);
router.get(
  "/:id",
OrderControllers.getSingleOrder
);
router.post(
  "/",
OrderControllers.createOrder
);

router.patch(
  "/:id",
  auth("admin"),
OrderControllers.updateOrder
);
router.delete(
  "/:id",
  auth("admin"),
OrderControllers.deleteOrder
);
router.get(
  "/top-orders",
  auth("admin"),
OrderControllers.getTopOrderedMenuItems
);



export const OrderRoutes = router;
