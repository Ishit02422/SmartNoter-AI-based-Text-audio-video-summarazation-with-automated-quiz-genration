import { Report } from "./types";
import { ReportModel } from "./schema";

/**
 *
 * @param report  class
 * @returns created report
 */
export const saveReport = async (report: Report) => {
  const savedReport = await new ReportModel(report.toJSON()).save();
  return savedReport;
};
