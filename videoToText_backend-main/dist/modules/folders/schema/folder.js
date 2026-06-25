"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderModel = void 0;
const mongoose_1 = require("mongoose");
const Folders = new mongoose_1.Schema({
    folderName: {
        type: String,
        required: false, // or true if you want it mandatory
    },
    folderPic: {
        type: String,
        required: false,
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users", // assuming your user model is named "User"
        required: false,
    },
}, {
    timestamps: true, // automatically adds createdAt and updatedAt
});
// Optional: export as model
exports.FolderModel = (0, mongoose_1.model)("Folders", Folders);
//# sourceMappingURL=folder.js.map