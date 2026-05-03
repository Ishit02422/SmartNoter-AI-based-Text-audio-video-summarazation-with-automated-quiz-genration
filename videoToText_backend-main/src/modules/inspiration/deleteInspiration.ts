import { inspirationModel } from "./schema";

/**
 * will delete Inspiration
 * @param _id
 */
export const deleteInspiration = async (_id: string) => {
  await inspirationModel.findByIdAndDelete(_id);
};
