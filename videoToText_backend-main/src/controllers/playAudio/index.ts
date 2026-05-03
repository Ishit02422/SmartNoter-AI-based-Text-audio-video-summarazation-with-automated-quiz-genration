import { Router } from "express";
import Controller from "./controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";

export class AudioSummary extends Controller {
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
      "/translatedSummary",
      validateAuthIdToken,
      validateUserPremium,
      this.createAudioForTranslatedSummary
    );
  }
}
