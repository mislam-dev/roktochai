import { Express, Request, Response } from "express";
import authRouter from "../auth/auth.routes";

const routeArrays = [
  {
    path: "/api/v1/auth",
    handler: authRouter,
  },

  {
    path: "/",
    handler: (req: Request, res: Response) => {
      return res.status(200).json({
        message: "You are good to go",
      });
    },
  },
];

const setRoutes = (app: Express) => {
  routeArrays.forEach((route) => {
    if (route.path === "/") {
      app.get(route.path, route.handler);
    } else {
      app.use(route.path, route.handler);
    }
  });
};

export default setRoutes;
