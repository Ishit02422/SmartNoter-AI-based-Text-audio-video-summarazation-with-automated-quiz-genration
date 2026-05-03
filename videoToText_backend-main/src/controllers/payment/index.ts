import { Router } from "express";
import Controller from "./controller";

export class Payment extends Controller {
  public router = Router();
  constructor() {
    super();
    this.router.post("/create-order", this.createOrder);
    this.router.post("/verify", this.verifyPayment);
  }
}
