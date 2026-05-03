import { Router } from "express";
import { filesUpload } from "../../middleware/filesUpload";
import Controller from "./image.controller";

export default class Image extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", filesUpload, this.createImage);
    this.router.post(
      "/imageToPrompt",
      filesUpload,
      this.createImageForImageToPrompt
    );
  }
}
