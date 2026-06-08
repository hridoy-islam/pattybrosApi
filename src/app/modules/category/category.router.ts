/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";


import { CategoryControllers } from "./category.controller";
import auth from "../../middlewares/auth";


const router = express.Router();
router.get(
  "/",
CategoryControllers.getAllCategory
);
router.get(
  "/:id",
CategoryControllers.getSingleCategory
);
router.post(
  "/",
  auth("admin"),
CategoryControllers.createCategory
);

router.patch(
  "/:id",
  auth("admin"),
CategoryControllers.updateCategory
);
router.delete(
  "/:id",
  auth("admin"),
CategoryControllers.deleteCategory
);



export const CategoryRoutes = router;
