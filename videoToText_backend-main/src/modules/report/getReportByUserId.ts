import { Report } from "./types";
import { ReportModel } from "./schema";

/**
 *
 * @param _id report id
 * @returns relevant report record | null
 */
export const getReportByUserId = async (userId: string) => {
  const report = await ReportModel.findOne({ reportedBy: userId });
  return report ? new Report(report) : null;
};
