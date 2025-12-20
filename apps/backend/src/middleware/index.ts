import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import passport from "passport";

import { AuthMiddleware } from "../auth/auth.middleware";

const authMiddleware = new AuthMiddleware();

const middleware = [
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
  morgan("dev"),
  express.urlencoded({ extended: true }),
  express.json(),
];

const setUpMiddleware = (app: Express) => {
  middleware.forEach((item) => {
    app.use(item);
  });

  app.use(passport.initialize());

  authMiddleware.init(passport);
};

export default setUpMiddleware;
