import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./user.controller";
import { Router } from "express";

export default class User extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", validateAuthIdToken, this.getUserById);
    this.router.get("/getProfile", validateAuthIdToken, this.getUserById);
    this.router.get(
      "/generatedSummary",
      validateAuthIdToken,
      this.generatedSummaryOfUser
    );
    this.router.delete(
      "/deleteHistory/:id",
      validateAuthIdToken,
      this.deleteHistory
    );
    this.router.delete("/:id", validateAuthIdToken, this.delete);
    this.router.patch("/", validateAuthIdToken, this.profileUpdate);
  }
}
