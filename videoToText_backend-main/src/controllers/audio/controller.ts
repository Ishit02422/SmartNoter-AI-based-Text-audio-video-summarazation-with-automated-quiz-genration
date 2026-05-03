import { Response } from "express";
import { get as _get } from "lodash";
import { createAndUploadAudio, getAudioById } from "../../modules/audio";
import { Request } from "./../../request";

export default class Controller {
  protected readonly createAudio = async (req: Request, res: Response) => {
    /*
      {
        fieldname: 'file',        String - name of the field used in the form
        originalname,             String - original filename of the uploaded audio
        encoding,                 String - encoding of the audio (e.g. "7bit")
        mimetype,                 String - MIME type of the file (e.g. "audio/jpeg")
        buffer,                   Buffer - buffer containing binary data
        size,                     Number - size of buffer in bytes
        filename,                 String - file name
        filepath                  String - file path
      }
    */
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request !");
      }
      const file = req.files[0];
      const audio = await createAndUploadAudio(
        file,
        req.body.title,
        authUser._id
      );
      const resAudio = await getAudioById(audio._id);
      return res.status(200).send(resAudio.toJSON());
    } catch (err) {
      console.log("########## Error in createAudio", err);
      return res.status(500).json({ error: _get(err, "message") });
    }
  };
}
