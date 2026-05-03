import { Router } from "express";
import Controller from "./mindMap.controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export class MindMap extends Controller {
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
      "/getMindMap",
      validateAuthIdToken,
      validateUserPremium,
      this.getMindMapBySummary
    );
  }
}
