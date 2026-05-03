import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  Feedback,
  getFeedbackByUserId,
  saveFeedback,
  updateFeedback,
} from "../../modules/feedback";
import { updateUser, User } from "../../modules/user";

export default class Controller {
  protected readonly feedbackCreateSchema = Joi.object().keys({
    appVersion: Joi.string().optional().allow(""),
    deviceName: Joi.string().optional().allow(""),
    deviceVersion: Joi.string().optional().allow(""),
    deviceId: Joi.string().optional().allow(""),
    location: Joi.string().optional().allow(""),
    option1: Joi.string().optional().allow(""),
    option2: Joi.string().optional().allow(""),
    option3: Joi.string().optional().allow(""),
    option4: Joi.string().optional().allow(""),
    comment: Joi.string().optional().allow(""),
    buildNumber: Joi.string().optional().allow(""),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.feedbackCreateSchema
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
      const existFeedback = await getFeedbackByUserId(authUser._id.toString());
      if (existFeedback) {
        const updatedFeedback = await updateFeedback(
          new Feedback({
            ...existFeedback,
            ...payloadValue,
            email: authUser.email,
            userId: authUser._id,
          })
        );
        return res.status(200).json(updatedFeedback);
      } else {
        const feedback = await saveFeedback(
          new Feedback({
            ...payloadValue,
            email: authUser.email,
            deviceId: authUser.deviceId,
            userId: authUser._id,
          })
        );

        const toBeUpdatedAccount = new User({
          ...authUser,
          feedBackGiven: true,
        });
        await updateUser(toBeUpdatedAccount);
        return res.status(200).json(feedback);
      }
    } catch (error) {
      console.log("error", "error in create feedback", error);
      return res.status(500).json({
        message: "Something happened wrong try again feedback after sometime",
        error: JSON.stringify(error),
      });
    }
  };
}
