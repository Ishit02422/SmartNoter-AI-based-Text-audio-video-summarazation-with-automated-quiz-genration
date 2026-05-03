import { Response } from "express";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  SupportedLanguage,
  deleteSupportedLanguage,
  getAllSupportedLanguage,
  getSpecificSupportedLanguage,
  getSupportedLanguageById,
  saveSupportedLanguage,
  updateSupportedLanguage,
} from "../../../modules/supportedLanguage";
import { Request } from "../../../request";
import { createAndUploadFlag } from "../../../modules/supportedLanguage/createAndUploadFlag";

export default class Controller {
  protected readonly createSupportedLanguageSchema = Joi.object().keys({
    country: Joi.string().required(),
    codeForText: Joi.string().required(),
  });

  protected readonly updateSupportedLanguageSchema = Joi.object().keys({
    country: Joi.string().required(),
    codeForText: Joi.string().required(),
  });

  protected readonly getSupportedLanguageSchema = Joi.object().keys({
    forDoc: Joi.boolean().required(),
  });

  protected readonly createSupportedLanguage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }
      const payloadValue = req.body;
      // const payloadValue = await this.createSupportedLanguageSchema
      //   .validateAsync(req.body)
      //   .then((value) => {
      //     return value;
      //   })
      //   .catch((e) => {
      //     if (isError(e)) {
      //       console.log("e", e);

      //       res.status(422).json(e);
      //     } else {
      //       res.status(422).json({ message: e.message });
      //     }
      //   });
      // if (!payloadValue) {
      //   return;
      // }
      const file = req.files[0];
      if (!file) {
        return res.status(422).json({ message: "file is required" });
      }
      const flagUrl = await createAndUploadFlag(file);
      // payloadValue.flag = flagUrl;
      const createdSupportedLanguageForDoc = await saveSupportedLanguage(
        new SupportedLanguage({
          country: payloadValue.country,
          codeForText: payloadValue.codeForText,
          flag: flagUrl.toString(),
        })
      );
      return res.status(200).json(createdSupportedLanguageForDoc);
    } catch (error) {
      console.log("########## Error in Getting createSupportedLanguage", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateSupportedLanguage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }
      const payloadValue = await this.updateSupportedLanguageSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      const updatedSupportedLanguageForDoc = await updateSupportedLanguage(
        new SupportedLanguage(payloadValue)
      );
      return res.status(200).json(updatedSupportedLanguageForDoc);
    } catch (error) {
      console.log("########## Error in Getting updateSupportedLanguage", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getSupportedLanguage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }

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

  protected readonly deleteSupportedLanguage = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }
      const supportedLanguageId = req.params.id;
      if (!supportedLanguageId) {
        return res
          .status(422)
          .json({ message: "supportedLanguageId is required" });
      }
      const supportedLanguage = await getSupportedLanguageById(
        supportedLanguageId
      );
      if (!supportedLanguage) {
        return res.status(422).json({ message: "supportedLanguage not found" });
      }
      await deleteSupportedLanguage(supportedLanguageId);
      return res.status(200).json({ message: "supportedLanguage deleted" });
    } catch (error) {
      console.log("########## Error in Getting deleteSupportedLanguage", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
