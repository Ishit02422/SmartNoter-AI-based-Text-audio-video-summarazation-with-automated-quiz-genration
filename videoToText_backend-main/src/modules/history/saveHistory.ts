import { HistoryModel } from "./schema/history";
import { History } from "./types";
/**
 *
 * @param data
 * @returns savedData
 */
export const saveHistory = async (data: History) => {
  const savedData = await new HistoryModel(data).save();
  return savedData;
};
