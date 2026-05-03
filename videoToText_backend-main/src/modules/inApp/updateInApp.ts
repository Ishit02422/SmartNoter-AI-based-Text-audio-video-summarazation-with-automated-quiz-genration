import { InApp } from ".";
import { inAppModel } from "./schema";

/**
 *
 * @param inApp
 * @returns update inApp record
 */
export const updateInApp = async (inApp: InApp) => {
  await inAppModel.findByIdAndUpdate(inApp._id, inApp.toJSON());
  return inApp;
};
