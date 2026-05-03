import { Response } from "express";
import { Request } from "../../request";
import { getHistory } from "../../modules/history";
import { StatusCodes } from "http-status-codes";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const history = await getHistory(authUser._id);
      if (history.length === 0) {
        return res
          .status(StatusCodes.NO_CONTENT)
          .json({ message: "No History", success: false });
      }
      res
        .status(StatusCodes.OK)
        .json({ message: "History Fetched", success: true, result: history });
    } catch (error) {
      console.log("error", "error in fetch history", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again fetch history after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
