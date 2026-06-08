/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";


import { ReservationControllers } from "./reservation.controller";
import auth from "../../middlewares/auth";


const router = express.Router();
router.get(
  "/",
ReservationControllers.getAllReservation
);
router.get(
  "/:id",
ReservationControllers.getSingleReservation
);
router.post(
  "/",
  
ReservationControllers.createReservation
);

router.patch(
  "/:id",
  auth("admin"),
ReservationControllers.updateReservation
);
router.delete(
  "/:id",
  auth("admin"),
ReservationControllers.deleteReservation
);



export const ReservationRoutes = router;
