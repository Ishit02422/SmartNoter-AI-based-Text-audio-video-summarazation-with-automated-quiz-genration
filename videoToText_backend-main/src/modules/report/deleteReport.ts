import { ReportModel } from "./schema";

/**
 * will delete user
 * @param _id
 */
export const deleteReport = async (_id: string) => {
  await ReportModel.findByIdAndDelete(_id);
};
