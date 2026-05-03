import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { filesUpload } from "../../middleware/filesUpload";
import Controller from "./controller";
import { validateUserPremium } from "../../middleware/validateUserPremium";

export class Translate extends Controller {
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
  }
}
