import { Inspiration } from "./types";
import { inspirationModel } from "./schema";

/**
 *
 * @param Inspiration
 * @returns update Inspiration record
 */
export const updateInspiration = async (inspiration: Inspiration) => {
  await inspirationModel.findByIdAndUpdate(
    inspiration._id,
    inspiration.toJSON()
  );
  return inspiration;
};
