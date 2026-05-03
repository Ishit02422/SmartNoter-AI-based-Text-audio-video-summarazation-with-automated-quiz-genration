import { Report } from "./types";
import { ReportModel } from "./schema";

/**
 *
 * @param _id report id
 * @returns relevant report record | null
 */
export const getReportById = async (_id: string) => {
  const report = await ReportModel.findById(_id).populate({
    path: "thumbnail",
  });
  return report ? new Report(report) : null;
};
