import { Router } from "express";
import Controller from "./flashcard.controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";

export class FlashCard extends Controller {
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
      "/getFlashCards",
      validateAuthIdToken,
      this.getAllFlashCards
    );
  }
}
