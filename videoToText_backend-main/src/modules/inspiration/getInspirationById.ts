import { Inspiration } from "./types";
import { inspirationModel } from "./schema";

/**
 *
 * @param _id Inspiration id
 * @returns relevant category record | null
 */
export const getInspirationById = async (_id: string) => {
  const inspiration = await inspirationModel
    .findById(_id)
    .lean()
    .populate({ path: "generatedSummaryId", populate: { path: "imageId" } });
  return inspiration ? new Inspiration(inspiration) : null;
};
