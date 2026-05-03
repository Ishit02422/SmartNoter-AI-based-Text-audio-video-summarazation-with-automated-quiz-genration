import express, { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import AdminAuth from "./auth";
import AdminFeedback from "./feedback";
import AdminUser from "./user";
import AdminImage from "./image";
import AdminInspiration from "./inspiration";
import AdminSupportedLanguage from "./supportedLanguage";

export default class Admin {
  public instance: express.Application;
  public router = Router();

  constructor() {
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.instance.use(
      "/user",
      validateAuthIdToken,
      validateIsAdmin,
      new AdminUser().router
    );
    this.instance.use("/auth", new AdminAuth().router);
    this.instance.use(
      "/image",
      validateAuthIdToken,
      validateIsAdmin,
      new AdminImage().router
    );

    this.instance.use(
      "/feedback",
      validateAuthIdToken,
      validateIsAdmin,
      new AdminFeedback().router
    );

    this.instance.use(
      "/inspiration",
      validateAuthIdToken,
      validateIsAdmin,
      new AdminInspiration().router
    );
    this.instance.use(
      "/supportedLanguage",
      new AdminSupportedLanguage().router
    );
  }
}
