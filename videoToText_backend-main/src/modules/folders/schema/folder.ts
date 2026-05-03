import { Schema, model, Types } from "mongoose";
import { IFolders } from "../types";

const Folders = new Schema<IFolders>(
  {
    folderName: {
      type: String,
      required: false, // or true if you want it mandatory
    },
    folderPic: {
      type: String,
      required: false,
    },
    userId: {
      type: Types.ObjectId,
      ref: "users", // assuming your user model is named "User"
      required: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// Optional: export as model
export const FolderModel = model<IFolders>("Folders", Folders);
