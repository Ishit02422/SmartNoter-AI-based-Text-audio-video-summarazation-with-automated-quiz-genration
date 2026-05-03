import axios from "axios";
import { createAndUploadGeneratedSummary } from ".";
/**
 *
 * @param imageUrl
 * @param title
 * @returns
 */
export const createAndUploadSummaryFromLink = async (imageUrl: string) => {
  try {
    // Download the image
    // return
    const image = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const downloadedImage = await createAndUploadGeneratedSummary(image.data);
    return downloadedImage;
  } catch (err) {
    console.log("########## Error in createAndUploadSummaryFromLink", err);
  }
};
