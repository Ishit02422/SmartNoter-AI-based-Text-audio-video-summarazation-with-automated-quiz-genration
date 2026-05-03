import { Router } from "express";
import Controller from "./chatWithAI.controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateUserPremium } from "../../middleware/validateUserPremium";

export default class ChatWithAI extends Controller {
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
      "/enterToChat",
      validateAuthIdToken,
      validateUserPremium,
      this.enterChat
    );
  }
}
