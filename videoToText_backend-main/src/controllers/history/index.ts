import { Router } from "express";
import Controller from "./history";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export default class History extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initilizeRoutes();
  }
  private initilizeRoutes() {
    this.router.get(
      "/",
      validateAuthIdToken,
      this.get
    );
  }
}
