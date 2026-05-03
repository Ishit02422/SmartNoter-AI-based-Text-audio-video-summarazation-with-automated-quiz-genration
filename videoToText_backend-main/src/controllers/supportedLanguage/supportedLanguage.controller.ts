import { Response } from "express";
import { get as _get } from "lodash";
import {
  getAllSupportedLanguage,
  getSpecificSupportedLanguage,
} from "../../modules/supportedLanguage";
import Joi, { isError } from "joi";
import { Request } from "../../request";

export default class Controller {
  protected readonly getSupportedLanguage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const supportedLanguageForText = await getAllSupportedLanguage();
      return res.status(200).json(supportedLanguageForText);
    } catch (error) {
      console.log(
        "########## Error in Getting getSupportedLanguageForDoc",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
