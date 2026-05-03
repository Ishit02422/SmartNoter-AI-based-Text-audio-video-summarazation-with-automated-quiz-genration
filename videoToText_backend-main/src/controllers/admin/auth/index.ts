import { Router } from "express";
import { validateAuthIdToken } from "../../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../../middleware/validateIsAdmin";
import Controller from "./auth.controller";

export default class AdminAuth extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/login", this.login);
    this.router.post("/register", this.register);
    this.router.post(
      "/session",
      validateAuthIdToken,
      validateIsAdmin,
      this.session
    );
    this.router.post(
      "/logout",
      validateAuthIdToken,
      validateIsAdmin,
      this.logout
    );
  }
}
