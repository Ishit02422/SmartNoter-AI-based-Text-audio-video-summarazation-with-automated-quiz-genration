import { Router } from "express";
import Controller from "./generatedSummaryVideo.controller";
import { validateUserPremium } from "../../middleware/validateUserPremium";
export default class GenerateSummaryFromVideo extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/youtube",
      
      validateUserPremium,
      this.create
    );

     this.router.post(
      "/youtube/direct",
      
      validateUserPremium,
      this.createDirect
    );

    this.router.patch(
      "/youtube/:id",
      
      this.update
    );

     this.router.post(
      "/upload",
      
      validateUserPremium,
      this.uploadedVideo
    );
     this.router.post(
      "/upload/direct",
      
      validateUserPremium,
      this.uploadedVideoDirect
    );
    
    this.router.patch(
      "/youtube/:id",
       
      this.update
    );

    this.router.delete(
      "/youtube/:id",
      
      this.delete
    );

    // this.router.get("/:id",)
    // this.router.get("/", )
  }
}
