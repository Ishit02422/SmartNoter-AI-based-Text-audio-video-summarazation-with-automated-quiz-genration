"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const video_1 = require("../../modules/video");
class Controller {
    constructor() {
        this.createVideo = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request !");
                }
                const file = req.files[0];
                const video = await (0, video_1.createAndUploadVideo)(file, req.body.title, authUser._id);
                const resVideo = await (0, video_1.getVideoById)(video._id);
                return res.status(200).send(resVideo.toJSON());
            }
            catch (err) {
                console.log("########## Error in create video", err);
                return res.status(500).json({ error: (0, lodash_1.get)(err, "message") });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map