import { PDF } from ".";
import { PdfModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant pdf
 */
export const getPdfById = async (_id: string) => {
  const pdf = await PdfModel.findById(_id);
  return pdf ? new PDF(pdf) : null;
};
