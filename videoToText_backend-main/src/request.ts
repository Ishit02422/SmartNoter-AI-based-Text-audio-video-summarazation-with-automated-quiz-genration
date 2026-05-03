import { Request as ExpressRequest } from "express";
import { IUser } from "./modules/user";

// Define the Request interface by extending ExpressRequest
export interface Request extends ExpressRequest {
  authUser?: IUser;
  userId?: string;
  isAdmin: boolean;
  // Define the files property with the correct type
  files?:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[];
}
