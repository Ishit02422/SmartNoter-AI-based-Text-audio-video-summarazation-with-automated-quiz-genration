import { Response } from "express";
import { get as _get } from "lodash";
import {
  createAndUploadImage,
  createAndUploadImageAndThumbnail,
  createAndUploadThumbnail,
  getImageById,
} from "../../../modules/image";
import { Request } from "../../../request";

export default class Controller {
  protected readonly createImage = async (req: Request, res: Response) => {
    /*
      {
        fieldname: 'file',        String - name of the field used in the form
        originalname,             String - original filename of the uploaded image
        encoding,                 String - encoding of the image (e.g. "7bit")
        mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
        buffer,                   Buffer - buffer containing binary data
        size,                     Number - size of buffer in bytes
        filename,                 String - file name
        filepath                  String - file path
      }
    */
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }

      const file = req.files[0];
      let image;
      if (req.body.thumbnail) {
        image = await createAndUploadThumbnail(
          file,
          req.body.title,
          req.body.description,
          authUser._id.toString()
        );
      } else {
        image = await createAndUploadImageAndThumbnail(
          file,
          req.body.title,
          req.body.description,
          authUser._id
        );
      }
      const resImage = await getImageById(image._id);
      image = null;
      return res.status(200).json(resImage);
    } catch (err) {
      console.log("########## Error in createImage", err);
      return res.status(500).json({ error: _get(err, "message") });
    }
  };

  protected readonly uploadJson = async (req: Request, res: Response) => {
    /*
      {
        fieldname: 'file',        String - name of the field used in the form
        originalname,             String - original filename of the uploaded image
        encoding,                 String - encoding of the image (e.g. "7bit")
        mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
        buffer,                   Buffer - buffer containing binary data
        size,                     Number - size of buffer in bytes
        filename,                 String - file name
        filepath                  String - file path
      }
    */
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }

      const file = req.files[0];
      let image;

      image = await createAndUploadImage(
        file,
        req.body.title,
        req.body.description,
        authUser._id
      );

      const resImage = await getImageById(image._id);
      image = null;
      return res.status(200).json(resImage);
    } catch (err) {
      console.log("########## Error in createImage", err);
      return res.status(500).json({ error: _get(err, "message") });
    }
  };

  // protected readonly deleteImage = async (req: Request, res: Response) => {
  //   try {
  //     //
  //   } catch (err) {
  //     console.log("########## Error in deletingImage", err);
  //     res.status(500).json({ error: _get(err, "message") });
  //   }
  //   // var s3 = AWS.S3(awsCredentials);
  //   // s3.deleteObject(
  //   //   {
  //   //     Bucket: MY_BUCKET,
  //   //     Key: "some/subfolders/nameofthefile1.extension",
  //   //   },
  //   //   function (err, data) {}
  //   // );
  // };
}
