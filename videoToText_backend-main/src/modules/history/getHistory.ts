import mongoose, { Types } from "mongoose";
import { HistoryModel } from "./schema/history";
import { modelNames } from "./types";
/**
 *
 * @param data
 * @returns savedData
 */
export const getHistory = async (userId: string | Types.ObjectId) => {
  const res = await Promise.all(
    modelNames.map(async (type) => {
      const history = await HistoryModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
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
    })
  );

  return res.flat(); // if you want a flat array of all results
};
