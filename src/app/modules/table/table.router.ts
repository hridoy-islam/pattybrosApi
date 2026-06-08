/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";

import { TableControllers } from "./table.controller";
import auth from "../../middlewares/auth";

const router = express.Router();
router.get("/", TableControllers.getAllTable);
router.get("/:id", TableControllers.getSingleTable);
router.post(
  "/",
  auth("admin"),

  TableControllers.createTable,
);

router.patch("/:id", auth("admin"), TableControllers.updateTable);
router.delete("/:id", auth("admin"), TableControllers.deleteTable);

export const TableRoutes = router;
