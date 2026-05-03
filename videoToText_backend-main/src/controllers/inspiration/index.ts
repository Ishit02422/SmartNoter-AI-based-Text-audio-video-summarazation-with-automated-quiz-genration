import Controller from "./inspiration.controller";
import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

export default class Inspiration extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/getCategory", this.getCategory);
    this.router.get("/get/:category", this.get);
    this.router.get("/:id", this.getById);
  }
}
