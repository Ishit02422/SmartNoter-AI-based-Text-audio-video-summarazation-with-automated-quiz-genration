import { filesUpload } from "../../../middleware/filesUpload";
import { validateAuthIdToken } from "../../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../../middleware/validateIsAdmin";
import Controller from "./supportedLanguage.controller";
import { Router } from "express";

export default class AdminSupportedLanguage extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/",
      validateAuthIdToken,
      validateIsAdmin,
      filesUpload,
      this.createSupportedLanguage
    );
    this.router.patch(
      "/",
      validateAuthIdToken,
      validateIsAdmin,
      this.updateSupportedLanguage
    );
    this.router.get("/", this.getSupportedLanguage);
    this.router.delete(
      "/:id",
      validateAuthIdToken,
      validateIsAdmin,
      this.deleteSupportedLanguage
    );
  }
}
