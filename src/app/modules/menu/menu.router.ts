/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";


import { MenuControllers } from "./menu.controller";
import auth from "../../middlewares/auth";


const router = express.Router();
router.get(
  "/",
MenuControllers.getAllMenu
);
router.get(
  "/:id",
MenuControllers.getSingleMenu
);
router.post(
  "/",
  auth("admin"),
MenuControllers.createMenu
);

router.patch(
  "/:id",
  auth("admin"),
MenuControllers.updateMenu
);
router.delete(
  "/:id",
  auth("admin"),
MenuControllers.deleteMenu
);



export const MenuRoutes = router;
