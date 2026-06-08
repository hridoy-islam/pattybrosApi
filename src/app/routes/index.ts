import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.router";


import { UploadDocumentRoutes } from "../modules/documents/documents.route";
import { CategoryRoutes } from "../modules/category/category.router";
import { MenuRoutes } from "../modules/menu/menu.router";
import { OrderRoutes } from "../modules/order/order.router";
import { TableRoutes } from "../modules/table/table.router";
import { ReservationRoutes } from "../modules/reservation/reservation.router";


const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },


  {
    path: "/documents",
    route: UploadDocumentRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/menu",
    route: MenuRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/table",
    route: TableRoutes,
  },
  {
    path: "/reservation",
    route: ReservationRoutes,
  },


 
 
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
