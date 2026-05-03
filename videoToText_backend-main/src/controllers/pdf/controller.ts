import { Response } from "express";
import { Request } from "../../request";
import { get as _get } from "lodash";
import { createAndUploadPDF, getPdfById } from "../../modules/pdf";
import { StatusCodes } from "http-status-codes";

export default class Controller {
  protected readonly createPdf = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request !");
      }
      const file = req.files[0];
      if (!file?.originalname?.endsWith(".pdf")) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, message: "Invalid PDF, Please Upload PDF" });
      }
      const pdf = await createAndUploadPDF(file, req.body?.title, authUser._id);
      console.log(pdf,"pdf created");
      
      const resPdf = await getPdfById(pdf?._id);
      return res.status(200).json(resPdf.toJSON());
    } catch (error) {
      console.log("########## Error in createPdf", error);
      return res.status(500).json({ error: _get(error, "message") });
    }
  };
}
