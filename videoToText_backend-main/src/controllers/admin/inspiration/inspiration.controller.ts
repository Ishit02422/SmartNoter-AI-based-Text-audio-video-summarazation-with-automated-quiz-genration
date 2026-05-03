import { Response } from "express";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { getGeneratedSummaryById } from "../../../modules/generatedSummary";
import {
  Inspiration,
  deleteInspiration,
  getInspiration,
  getInspirationByCategory,
  getInspirationById,
  saveInspiration,
  updateInspiration,
} from "../../../modules/inspiration";
import { Request } from "../../../request";

export default class Controller {
  private readonly createInspirationSchema = Joi.object().keys({
    generatedSummaryId: Joi.string()
      .optional()
      .external(async (value) => {
        if (!value) {
          return value;
        }
        const generatedSummary = await getGeneratedSummaryById(value);
        if (!generatedSummary) {
          throw new Error("Invalid generatedSummaryId");
        }
        return value;
      }),
    category: Joi.string().required(),
  });

  private readonly inspirationUpdateSchema = Joi.object().keys({
    generatedImageId: Joi.string()
      .required()
      .external(async (value) => {
        if (!value) {
          return value;
        }
        const generatedImage = await getGeneratedSummaryById(value);
        if (!generatedImage) {
          throw new Error("Invalid generatedImageId");
        }
        return value;
      }),
    category: Joi.string().required(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payloadValue = await this.createInspirationSchema
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

      const inspiration = await saveInspiration(
        new Inspiration({ ...payloadValue })
      );
      return res.status(200).json(inspiration);
    } catch (error) {
      console.log("error", "error in create inspiration", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: JSON.stringify(error),
      });
    }
  };

  protected readonly getCategory = async (req: Request, res: Response) => {
    try {
      const category = [
        "Motivation",
        "Inspiration",
        "Happiness",
        "Love",
        "Life",
        "Success",
        "Relationship",
        "Friendship",
        "Money",
        "Health",
        "Humor",
        "Leadership",
        "Education",
        "Work",
        "Art",
        "Science",
        "Technology",
        "Sports",
        "Music",
        "Movies",
        "Books",
        "Travel",
        "Food",
        "Fashion",
        "Nature",
        "Animals",
        "Spirituality",
        "Religion",
        "Politics",
      ];
      return res.status(200).send(category);
    } catch (err) {
      console.log("########## Error in getCategory", err);
      return res.status(500).json({ error: _get(err, "message") });
    }
  };

  protected readonly getByCategory = async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      if (!category) {
        return res.status(422).json({ message: "Invalid category." });
      }
      const inspiration = await getInspirationByCategory(category);
      return res.status(200).send(inspiration);
    } catch (err) {
      console.log("########## Error in getByCategory", err);
      return res.status(500).json({ error: _get(err, "message") });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(422).json({ message: "Invalid Id." });
      }
      const payloadValue = await this.inspirationUpdateSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }

      const inspiration = await getInspirationById(id);

      const toBeUpdateInspiration = new Inspiration({
        ...inspiration,
        ...payloadValue,
      });

      const updateData = await updateInspiration(toBeUpdateInspiration);

      return res.status(200).json(updateData);
    } catch (error) {
      console.log("error", "error in update inspiration", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: JSON.stringify(error),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const inspirationId = req.params.id;
      if (!inspirationId) {
        return res
          .status(422)
          .json({ message: "Please provide inspirationId" });
      }
      const inspiration = await getInspirationById(inspirationId);
      if (!inspiration) {
        return res.status(422).json({ message: "Invalid Id." });
      }
      await deleteInspiration(inspirationId);
      return res.status(200).json("deleted successfully");
    } catch (error) {
      console.log("error", "error in delete inspiration", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: JSON.stringify(error),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const inspirationId = req.params._id;
      if (inspirationId) {
        const inspiration = await getInspirationById(inspirationId);
        return res.status(200).json(inspiration);
      }
      const inspiration = await getInspiration();
      return res.status(200).json(inspiration);
    } catch (error) {
      console.log("########## Error in Getting inspiration", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
