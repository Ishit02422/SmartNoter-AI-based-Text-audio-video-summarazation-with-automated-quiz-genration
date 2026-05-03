import Controller from "./generatedSummary.controller";
import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

export default class GeneratedSummary extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/", validateAuthIdToken, this.create);
    this.router.patch("/:id", validateAuthIdToken, this.update);
  }
}
