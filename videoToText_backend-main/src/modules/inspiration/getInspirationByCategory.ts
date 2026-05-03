import { Inspiration } from "./types";
import { inspirationModel } from "./schema";

/**
 *
 * @returns all inspiration records | empty array
 */
export const getInspirationByCategory = async (category: string) => {
  const inspiration = await inspirationModel
    .find({ category })
    .lean()
    .populate({ path: "generatedSummaryId", populate: { path: "imageId" } });
  // .sort({ createdAt: -1 });
  return inspiration ? inspiration.map((item) => new Inspiration(item)) : null;
};
