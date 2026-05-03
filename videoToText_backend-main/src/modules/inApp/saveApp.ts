import { InApp } from "./types";
import { inAppModel } from "./schema";

export const saveInApp = async (inApp: InApp) => {
  await new inAppModel(inApp.toJSON()).save();
  return inApp;
};
