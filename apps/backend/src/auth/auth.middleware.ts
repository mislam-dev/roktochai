import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";

import { NextFunction, Request, Response } from "express";
import passport, { PassportStatic } from "passport";
import { AuthService } from "./auth.service";

export class AuthMiddleware {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  init(passport: PassportStatic) {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    };

    passport.use(
      new Strategy(opts, async (payload, done) => {
        try {
          const user: any = await this.authService.findOne({
            id: payload.id,
          });
          if (!user) return done(null, false);
          return done(null, user);
        } catch (error) {
          console.log(error, "1rs");
          return done(error);
        }
      })
    );
  }

  authenticate(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", (err: any, user: any, info: any) => {
      if (err) {
        console.log(err); // todo remove later
        console.log(info); // todo remove later
        return next(err);
      }
      if (!user) {
        // todo throw  a custom class
        return res.status(401).json({
          message: "Authentication failed!",
        });
      }
      req.user = user;
      return next();
    })(req, res, next);
  }

  isAuthenticate(req: Request, res: Response, next: NextFunction) {
    try {
      this.authenticate(req, res, next);
    } catch (error) {
      return next();
    }
  }

  async isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req as any).user?.role.role;
      if (role === "admin" || role === "super_admin") {
        return next();
      }
      // todo throw custom error
      return res.status(401).json({
        message: "You are not authorize to perform this action!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
  async isSuperAdmin(req: Request<any>, res: Response, next: NextFunction) {
    try {
      if ((req as any).user?.role.role === "super_admin") return next();
      // todo throw custom error
      return res.status(401).json({
        message: "You are not authorize to perform this action!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
