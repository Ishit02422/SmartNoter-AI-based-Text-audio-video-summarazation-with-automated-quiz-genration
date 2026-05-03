import { PDF } from ".";
import { PdfModel } from "./schema";

/**
 *
 * @param pdf pdf class
 */
export const deleteAudio = async (pdf: PDF) => {
  await PdfModel.findByIdAndDelete(pdf._id.toString());
};
