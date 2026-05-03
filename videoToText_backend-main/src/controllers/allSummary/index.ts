import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { Controller } from "./allSummary";

export default class Summaries extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/",  this.getSummaries);
    this.router.post("/export",this.export)
  }
}
