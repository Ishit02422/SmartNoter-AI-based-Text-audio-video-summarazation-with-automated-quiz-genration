import { MindMapModel } from "./schema";
import { IMindMap } from "./types";

/**
 *
 * @param data
 * @returns savedMindMap
 */
export const saveMindMap = async (data: IMindMap) => {
  const savedMindMap = await MindMapModel.create(data);
  return savedMindMap;
};
