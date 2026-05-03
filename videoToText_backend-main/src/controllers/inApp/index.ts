import Controller from "./inApp.controller";
import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

export default class InApp extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/purchaseGlitter",
      validateAuthIdToken,
      this.purchaseGlitter
    );
    this.router.post(
      "/purchaseSubscription",
      validateAuthIdToken,
      this.purchaseSubscriptionController
    );
  }
}
