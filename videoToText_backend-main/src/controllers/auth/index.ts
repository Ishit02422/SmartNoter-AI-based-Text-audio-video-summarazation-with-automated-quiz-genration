import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./auth.controller";

export default class Auth extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/loginWithGoogle", this.loginWithGoogle);
    this.router.post("/loginWithApple", this.loginWithApple);
    this.router.post("/logout", validateAuthIdToken, this.logout);
    this.router.post("/duplicate", this.duplicate);
    this.router.post("/guest", this.guest);
    this.router.post("/session", validateAuthIdToken, this.session);
  }
}
