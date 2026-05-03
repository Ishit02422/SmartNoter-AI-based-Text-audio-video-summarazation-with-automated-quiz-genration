import { Response } from "express";
import { Request } from "../../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { getFeedback, getPopulatedFeedback } from "../../../modules/feedback";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const feedback = await getPopulatedFeedback();
      return res.status(200).json(feedback);
    } catch (error) {
      console.log("########## Error in Getting feedback", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
