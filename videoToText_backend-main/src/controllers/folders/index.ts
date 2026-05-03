import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./folder";

export default class Folder extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", validateAuthIdToken, this.create);
    this.router.get("/", validateAuthIdToken, this.get);
    this.router.get("/:id", validateAuthIdToken, this.getById);
    this.router.patch("/:id", validateAuthIdToken, this.update);
    this.router.delete("/:id", validateAuthIdToken, this.delete);
    this.router.post("/move-note", validateAuthIdToken, this.moveNotesToFolder);
  }
}
