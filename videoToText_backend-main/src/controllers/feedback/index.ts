import Controller from "./feedback.controller";
import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

export default class Feedback extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/", this.create);
  }
}
