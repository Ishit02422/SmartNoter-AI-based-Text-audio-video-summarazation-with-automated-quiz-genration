import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { Controller } from "./generatedSummaryText";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export default class GenerateSummaryFromText extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.post(
      "/",
      validateAuthIdToken,
      validateUserPremium,
      this.create
    );
    this.router.post(
      "/direct",
      validateAuthIdToken,
      validateUserPremium,
      this.createDirect
    );
    this.router.patch(
      "/:id",
      validateAuthIdToken,
      this.update
    );
    this.router.delete(
      "/:id",
      validateAuthIdToken,
      this.delete
    );
  }
}
