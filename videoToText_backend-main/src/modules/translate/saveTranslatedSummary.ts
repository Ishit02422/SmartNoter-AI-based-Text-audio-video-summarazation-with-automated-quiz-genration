import { ITranslate, Translate } from "./types";
import { TranslateModel } from "./schema";

export const saveTranslatedSummary = async (data: ITranslate) => {

  const result = await TranslateModel.create(data);
  return result;
};
