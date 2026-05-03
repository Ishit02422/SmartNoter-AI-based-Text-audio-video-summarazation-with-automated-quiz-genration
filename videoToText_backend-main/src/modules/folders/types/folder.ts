import { IUser } from "../../user";

export interface IFolders {
  _id?: string;
  folderName?: string;
  folderPic?: string;
  userId?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Folder implements IFolders {
  _id?: string;
  folderName?: string;
  folderPic?: string;
  userId?: IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IFolders) {
    Object.assign(this, input);
  }
}
