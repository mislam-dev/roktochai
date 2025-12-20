import express, { Express } from "express";
import setUpMiddleware from "./middleware";
import setRoutes from "./routes";

declare global {
  namespace Express {
    interface Request {
      User?: {
        id: string;
        username?: string;
        roleId: string;
      };
    }
  }
}

const app: Express = express();

setUpMiddleware(app);
setRoutes(app);

app.listen(9000, () => {
  console.log("Server is running on port 9000");
});
