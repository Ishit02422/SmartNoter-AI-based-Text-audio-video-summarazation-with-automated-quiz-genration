import Controller from "./user.controller";
import { Router } from "express";

export default class AdminUser extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/", this.getAllUser);
  }
}
