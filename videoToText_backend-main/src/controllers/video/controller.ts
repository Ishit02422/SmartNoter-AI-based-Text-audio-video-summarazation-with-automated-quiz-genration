import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../request";
import { createAndUploadVideo, getVideoById } from "../../modules/video";

export default class Controller {
  protected readonly createVideo = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request !");
      }
      const file = req.files[0];
      const video = await createAndUploadVideo(
        file,
        req.body.title,
        authUser._id
      );
      const resVideo = await getVideoById(video._id);
      return res.status(200).send(resVideo.toJSON());
    } catch (err) {
      console.log("########## Error in create video", err);
      return res.status(500).json({ error: _get(err, "message") });
    }
  };
}
