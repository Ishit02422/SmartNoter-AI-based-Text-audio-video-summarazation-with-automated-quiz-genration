import { Response } from "express";
import { Request } from "../../../request";
import { getAllUser, getPopulatedUserById } from "../../../modules/user";

export default class Controller {
  protected readonly getAllUser = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request !");
      }
      const userId = req.params.id;
      if (userId) {
        const populatedUser = await getPopulatedUserById(userId);
        return res.status(200).json(populatedUser);
      } else {
        const allPopulatedUser = await getAllUser();
        return res.status(200).json(allPopulatedUser);
      }
    } catch (error) {
      console.log("error", "error in getAllUser", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime",
        error: JSON.stringify(error),
      });
    }
  };
}
