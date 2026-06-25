"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const lodash_1 = require("lodash");
const checkIfExistFolderWithUserId_1 = require("../../modules/folders/checkIfExistFolderWithUserId");
const folders_1 = require("../../modules/folders");
const http_status_codes_1 = require("http-status-codes");
const getFolderById_1 = require("../../modules/folders/getFolderById");
const checkIfNotesExistsInFolder_1 = require("../../modules/folders/checkIfNotesExistsInFolder");
const axios_1 = __importDefault(require("axios"));
class Controller {
    constructor() {
        this.createFolderSchema = joi_1.default.object().keys({
            folderName: joi_1.default.string()
                .external(async (v) => {
                if (!v)
                    return;
                const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(this.authUser._id, v);
                if (isExist)
                    throw new Error("Folder already exists");
                return v;
            })
                .required(),
            folderPic: joi_1.default.string().optional(),
        });
        this.editFolderSchema = joi_1.default.object().keys({
            folderName: joi_1.default.string()
                .external(async (v) => {
                if (!v)
                    return;
                const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(this.authUser._id, v);
                if (isExist)
                    throw new Error("Folder already exists");
                return v;
            })
                .optional(),
            folderPic: joi_1.default.string().optional(),
        });
        this.moveNoteFolderSchema = joi_1.default.object().keys({
            folderId: joi_1.default.string()
                .external(async (v) => {
                if (!v)
                    return;
                const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(this.authUser._id, "", v);
                if (!isExist)
                    throw new Error("Folder is not exists");
                return v;
            })
                .required(),
            source: joi_1.default.string()
                .valid("pdf", "audio", "video", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
        });
        this.create = async (req, res) => {
            const authUser = req.authUser;
            this.authUser = authUser;
            try {
                const payloadValue = await this.createFolderSchema.validateAsync(req.body);
                let picUrl;
                if (payloadValue.folderPic) {
                    picUrl = payloadValue.folderPic;
                }
                else {
                    const picResponse = await axios_1.default.get("https://picsum.photos/300", {
                        maxRedirects: 0, // prevent following the redirect
                        validateStatus: (status) => status === 302, // only accept 302 redirect
                    });
                    picUrl = picResponse.headers.location;
                }
                const folder = await (0, folders_1.createFolder)(authUser._id, {
                    folderName: payloadValue.folderName,
                    folderPic: picUrl,
                });
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Folder Created Successfully",
                    success: true,
                    result: folder,
                });
            }
            catch (error) {
                console.log("error", "error in create folders", error);
                return res.status(500).json({
                    message: "Something happened wrong try again create folder after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.update = async (req, res) => {
            const authUser = req.authUser;
            this.authUser = authUser;
            const { id } = req.params;
            try {
                const folderExist = await (0, getFolderById_1.getFolderById)(id, authUser._id);
                if (!folderExist) {
                    return res.status(404).json({ message: `Folder is not found` });
                }
                const payloadValue = await this.editFolderSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    if ((0, lodash_1.isError)(e)) {
                        res.status(422).json(e);
                    }
                    else {
                        res.status(422).json({ message: e.message });
                    }
                });
                const folder = await (0, folders_1.editFolder)(folderExist._id, payloadValue);
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Folder Updated Successfully",
                    success: true,
                    result: folder,
                });
            }
            catch (error) {
                console.log("error", "error in update folders", error);
                return res.status(500).json({
                    message: "Something happened wrong try again update folder after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.delete = async (req, res) => {
            const { id } = req.params;
            const authUser = req.authUser;
            try {
                const folderExist = await (0, getFolderById_1.getFolderById)(id, authUser._id);
                if (!folderExist) {
                    return res.status(404).json({ message: `Folder is not found` });
                }
                //   const data = await checkIfNotesExistsInFolder(folderExist._id);
                //   if (Object.keys(data).length > 0) {
                //   }
                const deletedFolder = await (0, folders_1.deleteFolder)(folderExist._id);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Folder Deleted Successfully", success: true });
            }
            catch (error) {
                console.log("error", "error in delete folders", error);
                return res.status(500).json({
                    message: "Something happened wrong try again delete folder after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.get = async (req, res) => {
            var _a, _b;
            try {
                const authUser = req.authUser;
                const folders = await (0, folders_1.getAllFolders)(authUser._id);
                if (((_a = folders.defaultFolder) === null || _a === void 0 ? void 0 : _a.length) === 0 &&
                    ((_b = folders.otherFolders) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "No Folders Yet", success: false });
                }
                res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Folders Fetched Successfully",
                    success: true,
                    result: folders,
                });
            }
            catch (error) {
                console.log("error", "error in get folders", error);
                return res.status(500).json({
                    message: "Something happened wrong try again get folder after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                const authUser = req.authUser;
                const folder = await (0, getFolderById_1.getFolderById)(id, authUser._id);
                if (!folder) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Folder not found", success: false });
                }
                const { res: result, audioFiles, pdfNotes, videoFiles, webNotes, textNotes, } = await (0, checkIfNotesExistsInFolder_1.checkIfNotesExistsInFolder)(folder._id, authUser._id);
                if (!result) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
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
                res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Folder Fetched Successfully",
                    success: true,
                    result: { folderData: finalFolder, result },
                });
            }
            catch (error) {
                console.log("error", "error in get folders", error);
                return res.status(500).json({
                    message: "Something happened wrong try again get folder after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.moveNotesToFolder = async (req, res) => {
            const authUser = req.authUser;
            this.authUser = authUser;
            try {
                const payloadValue = await this.moveNoteFolderSchema.validateAsync(req.body, { stripUnknown: true });
                const { source, folderId, summaryId } = payloadValue;
                const saved = await (0, folders_1.saveSummaryInFolder)(source, folderId, summaryId);
                res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Note Moved Successfully",
                    success: true,
                    result: saved,
                });
            }
            catch (error) {
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
}
exports.default = Controller;
//# sourceMappingURL=folder.js.map