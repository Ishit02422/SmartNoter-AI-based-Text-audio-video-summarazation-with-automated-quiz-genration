import { Router } from "express";
import Controller from "./rewards.controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

export class Reward extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/createReward", validateAuthIdToken, this.createReferral);
    this.router.post("/submitReward", validateAuthIdToken, this.submitReferral);
    this.router.get("/", validateAuthIdToken, this.getReward);
  }
}
