import { Router } from "express";
import Controller from "./generatedSummary.controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export default class GeneratedSummaryFromWeb extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initilizeRoutes();
  }
  private initilizeRoutes() {
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
    this.router.patch("/:id", validateAuthIdToken, this.update);
    this.router.delete("/:id",validateAuthIdToken,this.delete)
  }
}
