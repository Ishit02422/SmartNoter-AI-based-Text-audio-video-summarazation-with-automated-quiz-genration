import Controller from "./feedback.controller";
import { Router } from "express";

export default class AdminFeedback extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // this.router.post("/", this.create);
    // this.router.patch("/:_id", this.update);
    // this.router.delete("/:_id", this.delete);
    this.router.get("/", this.get);
  }
}
