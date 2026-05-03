import { Response } from "express";
import { get as _get } from "lodash";
import {
  getInspiration,
  getInspirationByCategory,
  getInspirationById,
} from "../../modules/inspiration";
import { Request } from "../../request";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      // const authUser = req.authUser;
      // if (!authUser) {
      //   return res.status(403).json("unauthorized request");
      // }
      const category = req.params.category;
      let inspirations;
      if (category == "All") {
        inspirations = await getInspiration();
      } else {
        inspirations = await getInspirationByCategory(category);
      }
      return res.status(200).json(inspirations);
    } catch (error) {
      console.log(
        "error",
        "error in getting inspiration#################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
  protected readonly getCategory = async (req: Request, res: Response) => {
    try {
      const category = [
        "All",
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

  protected readonly getById = async (req: Request, res: Response) => {
    try {
      // const authUser = req.authUser;
      // if (!authUser) {
      //   return res.status(403).json("unauthorized request");
      // }
      const inspirationId = req.params.id;
      const inspirations = await getInspirationById(inspirationId);
      return res.status(200).json(inspirations);
    } catch (error) {
      console.log(
        "error",
        "error in getting inspiration#################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
