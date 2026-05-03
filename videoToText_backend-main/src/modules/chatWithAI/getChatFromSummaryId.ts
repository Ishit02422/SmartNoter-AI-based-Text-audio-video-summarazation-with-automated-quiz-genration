import { Types } from "mongoose";
import { IUser } from "../user";
import { ChatWithAiModel } from "./schema";

/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns chats
 */
export const getChatFromSummaryId = async ({
  source,
  contextId,
  userId,
}: {
  source: string;
  contextId: string;
  userId: IUser;
}) => {
  const chats = await ChatWithAiModel.find({
    source,
    contextId,
    userId,
  })
    .populate("contextId")
    .sort({ createdAt: 1 });

  // let modelName: string;
  // if (source === "pdf") {
  //   modelName = "generatesummarypdfs";
  // } else if (source === "audio") {
  //   modelName = "generatedsummaryaudios";
  // } else if (source === "video") {
  //   modelName = "generatedsummaryvideos";
  // } else {
  //   throw new Error("Invalid source type");
  // }

  // const chats = await ChatWithAiModel.aggregate([
  //   {
  //     $match: {
  //       source,
  //       contextId: new Types.ObjectId(contextId),
  //       userId: new Types.ObjectId(userId._id),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: modelName,
  //       localField: "contextId",
  //       foreignField: "_id",
  //       as: "context",
  //     },
  //   },
  //   {
  //     $sort: {
  //       createdAt: 1,
  //     },
  //   },
  // ]);

  return chats;
};
