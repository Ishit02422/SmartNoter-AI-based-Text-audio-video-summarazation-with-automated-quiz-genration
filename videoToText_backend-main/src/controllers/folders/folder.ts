import { Response } from "express";
import { Request } from "../../request";
import Joi from "joi";
import { isError } from "lodash";
import { checkFolderExistsWithUserId } from "../../modules/folders/checkIfExistFolderWithUserId";
import { IUser } from "../../modules/user";
import {
  createFolder,
  deleteFolder,
  editFolder,
  getAllFolders,
  saveSummaryInFolder,
} from "../../modules/folders";
import { StatusCodes } from "http-status-codes";
import { getFolderById } from "../../modules/folders/getFolderById";
import { checkIfNotesExistsInFolder } from "../../modules/folders/checkIfNotesExistsInFolder";
import { IFolders } from "../../modules/folders/types";
import axios from "axios";
type folderType = {
  defaultFolder: IFolders[];
  otherFolders: IFolders[];
};
export default class Controller {
  private authUser: IUser;
  protected readonly createFolderSchema = Joi.object().keys({
    folderName: Joi.string()
      .external(async (v: string) => {
        if (!v) return;
        const isExist = await checkFolderExistsWithUserId(this.authUser._id, v);
        if (isExist) throw new Error("Folder already exists");
        return v;
      })
      .required(),
    folderPic: Joi.string().optional(),
  });
  protected readonly editFolderSchema = Joi.object().keys({
    folderName: Joi.string()
      .external(async (v: string) => {
        if (!v) return;
        const isExist = await checkFolderExistsWithUserId(this.authUser._id, v);
        if (isExist) throw new Error("Folder already exists");
        return v;
      })
      .optional(),
    folderPic: Joi.string().optional(),
  });
  protected readonly moveNoteFolderSchema = Joi.object().keys({
    folderId: Joi.string()
      .external(async (v: string) => {
        if (!v) return;
        const isExist = await checkFolderExistsWithUserId(
          this.authUser._id,
          "",
          v
        );
        if (!isExist) throw new Error("Folder is not exists");
        return v;
      })
      .required(),
    source: Joi.string()
      .valid("pdf", "audio", "video", "web", "text")
      .required(),
    summaryId: Joi.string().required(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    this.authUser = authUser;
    try {
      const payloadValue = await this.createFolderSchema.validateAsync(
        req.body
      );

      let picUrl;
      if (payloadValue.folderPic) {
        picUrl = payloadValue.folderPic;
      } else {
        const picResponse = await axios.get("https://picsum.photos/300", {
          maxRedirects: 0, // prevent following the redirect
          validateStatus: (status) => status === 302, // only accept 302 redirect
        });
        picUrl = picResponse.headers.location;
      }

      const folder = await createFolder(authUser._id, {
        folderName: payloadValue.folderName,
        folderPic: picUrl,
      });
      return res.status(StatusCodes.OK).json({
        message: "Folder Created Successfully",
        success: true,
        result: folder,
      });
    } catch (error) {
      console.log("error", "error in create folders", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again create folder after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
  protected readonly update = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    this.authUser = authUser;
    const { id } = req.params;
    try {
      const folderExist = await getFolderById(id, authUser._id);
      if (!folderExist) {
        return res.status(404).json({ message: `Folder is not found` });
      }
      const payloadValue = await this.editFolderSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      const folder = await editFolder(folderExist._id, payloadValue);
      return res.status(StatusCodes.OK).json({
        message: "Folder Updated Successfully",
        success: true,
        result: folder,
      });
    } catch (error) {
      console.log("error", "error in update folders", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again update folder after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
  protected readonly delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const authUser = req.authUser;
    try {
      const folderExist = await getFolderById(id, authUser._id);
      if (!folderExist) {
        return res.status(404).json({ message: `Folder is not found` });
      }
      //   const data = await checkIfNotesExistsInFolder(folderExist._id);
      //   if (Object.keys(data).length > 0) {

      //   }
      const deletedFolder = await deleteFolder(folderExist._id);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Folder Deleted Successfully", success: true });
    } catch (error) {
      console.log("error", "error in delete folders", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again delete folder after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const folders: folderType = await getAllFolders(authUser._id);
      if (
        folders.defaultFolder?.length === 0 &&
        folders.otherFolders?.length === 0
      ) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "No Folders Yet", success: false });
      }
      res.status(StatusCodes.OK).json({
        message: "Folders Fetched Successfully",
        success: true,
        result: folders,
      });
    } catch (error) {
      console.log("error", "error in get folders", error);
      return res.status(500).json({
        message: "Something happened wrong try again get folder after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
  protected readonly getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const authUser = req.authUser;
      const folder = await getFolderById(id, authUser._id);
      if (!folder) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Folder not found", success: false });
      }
      const {
        res: result,
        audioFiles,
        pdfNotes,
        videoFiles,
        webNotes,
        textNotes,
      } = await checkIfNotesExistsInFolder(folder._id, authUser._id);
      if (!result) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Folder not found.", success: false });
      }
      let finalFolder = {
        folder,
        totalAudioNotes: audioFiles,
        totalVideoNotes: videoFiles,
        totalPdfNotes: pdfNotes,
        totalWebNotes: webNotes,
        totalTextNotes: textNotes,
        totalNotes: audioFiles + textNotes + pdfNotes + videoFiles + webNotes,
      };
      res.status(StatusCodes.OK).json({
        message: "Folder Fetched Successfully",
        success: true,
        result: { folderData: finalFolder, result },
      });
    } catch (error) {
      console.log("error", "error in get folders", error);
      return res.status(500).json({
        message: "Something happened wrong try again get folder after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
  protected readonly moveNotesToFolder = async (
    req: Request,
    res: Response
  ) => {
    const authUser = req.authUser;
    this.authUser = authUser;
    try {
      const payloadValue = await this.moveNoteFolderSchema.validateAsync(
        req.body,
        { stripUnknown: true }
      );

      const { source, folderId, summaryId } = payloadValue;

      const saved = await saveSummaryInFolder(source, folderId, summaryId);

      res.status(StatusCodes.OK).json({
        message: "Note Moved Successfully",
        success: true,
        result: saved,
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }

      console.log("error in move note in folders", error);
      return res.status(500).json({
        message: "Something happened wrong, try again later",
        error: error.message,
      });
    }
  };
}
