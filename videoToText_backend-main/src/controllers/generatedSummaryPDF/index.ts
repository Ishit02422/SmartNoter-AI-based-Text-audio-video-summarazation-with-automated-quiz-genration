import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { Controller } from "./generatedSummaryPdf";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export default class GenerateSummaryPdf extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoute();
  }

  private initializeRoute() {
    this.router.post(
      "/",
      validateUserPremium,
      this.create
    );
    this.router.post(
      "/direct",
      validateUserPremium,
      this.createDirect
    );
    // Alias routes for frontend compatibility
    this.router.post(
      "/uploadPDF/direct",
      validateUserPremium,
      this.createDirect
    );
    this.router.post(
      "/uploadPDF",
      validateUserPremium,
      this.createDirect
    );
    this.router.patch(
      "/:id",
      this.update
    );
    this.router.delete("/:id", this.delete);
  }
}
