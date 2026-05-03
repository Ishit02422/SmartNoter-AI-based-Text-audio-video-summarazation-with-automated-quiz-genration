import { Report } from "./types";
import { ReportModel } from "./schema";

/**
 *
 * @param name report name
 * @returns relevant report record | null
 */
export const getReport = async () => {
  const report = await ReportModel.find().populate({
    path: "thumbnail",
  });
  return report ? report.map((item) => new Report(item)) : null;
};
