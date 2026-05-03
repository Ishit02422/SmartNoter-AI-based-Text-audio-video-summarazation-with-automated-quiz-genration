import { Report } from "./types";
import { ReportModel } from "./schema";

/**
 *
 * @param report
 * @returns update user record
 */
export const updateReport = async (report: Report) => {
  await ReportModel.findByIdAndUpdate(report._id, report.toJSON());
  return report;
};
