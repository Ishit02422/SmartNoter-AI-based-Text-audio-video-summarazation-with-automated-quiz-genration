import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./supportedLanguage.controller";
import { Router } from "express";

export default class SupportedLanguage extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", this.getSupportedLanguage);
  }
}
