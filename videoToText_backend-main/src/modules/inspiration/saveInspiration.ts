import { Inspiration } from "./types";
import { inspirationModel } from "./schema";

export const saveInspiration = async (inspiration: Inspiration) => {
  await new inspirationModel(inspiration.toJSON()).save();
  return inspiration;
};
