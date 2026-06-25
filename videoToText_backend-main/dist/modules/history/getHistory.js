"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const history_1 = require("./schema/history");
const types_1 = require("./types");
/**
 *
 * @param data
 * @returns savedData
 */
const getHistory = async (userId) => {
    const res = await Promise.all(types_1.modelNames.map(async (type) => {
        const history = await history_1.HistoryModel.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    modelName: type,
                },
            },
            {
                $unwind: "$modelId",
            },
            {
                $lookup: {
                    from: type,
                    localField: "modelId",
                    foreignField: "_id",
                    as: "data",
                },
            },
            {
                $unwind: "$data",
            },
            {
                $group: {
                    _id: "$_id",
                    modelName: { $first: "$modelName" },
                    userId: { $first: "$userId" },
                    createdAt: { $first: "$createdAt" },
                    data: { $push: "$data" },
                },
            },
        ]);
        return history;
    }));
    return res.flat(); // if you want a flat array of all results
};
exports.getHistory = getHistory;
//# sourceMappingURL=getHistory.js.map