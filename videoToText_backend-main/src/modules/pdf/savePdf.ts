import { PDF } from ".";
import { PdfModel } from "./schema";

/**
 * function for save pdf in database
 * @param pdf
 * @returns pdf itself
 */
export const savePdf = async (pdf: PDF) => {
  await new PdfModel(pdf.toJSON()).save();
  return pdf;
};
