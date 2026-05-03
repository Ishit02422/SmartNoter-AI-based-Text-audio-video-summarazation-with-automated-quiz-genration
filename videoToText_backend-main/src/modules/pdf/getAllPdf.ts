import { IPdf, PDF } from "./types";
import { PdfModel } from "./schema";

/**
 *
 * @param name pdf name
 * @returns relevant category record | null
 */
export const getAllPdf = async (createdAt) => {
  const pdf = await PdfModel.find(createdAt);
  return pdf ? pdf.map((item) => new PDF(item)) : null;
};
