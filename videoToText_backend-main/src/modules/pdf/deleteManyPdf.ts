import { PDF } from ".";
import { PdfModel } from "./schema";

/**
 *
 * @param pdf class
 */
export const deleteManyPdf = async (createdAt) => {
  await PdfModel.deleteMany(createdAt);
};
