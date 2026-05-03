import Controller from "./inspiration.controller";
import { Router } from "express";

export default class AdminInspiration extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/", this.create);
    this.router.patch("/:id", this.update);
    this.router.delete("/:id", this.delete);
    this.router.get("/", this.get);
    this.router.get("/:id", this.get);
    this.router.get("/getCategory", this.getCategory);
    this.router.get("/getByCategory/:category", this.getByCategory);
  }
}
