import { Router } from "express";
import Controller from "./quiz.controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";

export class Quiz extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/",
      validateAuthIdToken,
      validateUserPremium,
      this.create
    );
    this.router.post(
      "/result",
      validateAuthIdToken,
      validateUserPremium,
      this.result
    );
    this.router.post(
      "/answered",
      validateAuthIdToken,
      validateUserPremium,
      this.answered
    );
  }
}
