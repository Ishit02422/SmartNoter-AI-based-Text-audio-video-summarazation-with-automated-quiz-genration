import { Router } from "express";
import Controller from "./controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { filesUpload } from "../../middleware/filesUpload";

export class Pdf extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("",  filesUpload, this.createPdf);
  }
}
