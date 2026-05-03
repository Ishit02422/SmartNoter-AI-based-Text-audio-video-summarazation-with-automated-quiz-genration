import { Router } from "express";
import { filesUpload } from "../../middleware/filesUpload";
import Controller from "./controller";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

export default class Audio extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", filesUpload, this.createAudio);
  }
}
