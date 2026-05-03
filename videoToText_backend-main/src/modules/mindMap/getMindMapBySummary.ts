import { Types } from "mongoose";
import { MindMapModel } from "./schema";
export const getMindmapSummary = async (
  summaryId: Types.ObjectId | string,
  source: string,
  userId: Types.ObjectId | string
) => {
  const mindmap = await MindMapModel.findOne({ summaryId, userId, source });
  return mindmap;
};
