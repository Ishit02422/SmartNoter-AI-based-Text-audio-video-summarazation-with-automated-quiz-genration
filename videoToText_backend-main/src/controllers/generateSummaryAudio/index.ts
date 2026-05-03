import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { Controller } from "./generateSummaryAudio";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export default class GenerateSummaryAudio extends Controller {
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
    this.router.patch(
      "/:id",
      
      this.update
    );
    this.router.delete("/:id",this.delete);
  }
}
