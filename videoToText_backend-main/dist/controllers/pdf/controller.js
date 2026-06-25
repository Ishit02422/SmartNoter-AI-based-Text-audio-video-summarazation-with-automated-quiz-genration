"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const pdf_1 = require("../../modules/pdf");
const http_status_codes_1 = require("http-status-codes");
class Controller {
    constructor() {
        this.createPdf = async (req, res) => {
            var _a, _b;
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request !");
                }
                const file = req.files[0];
                if (!((_a = file === null || file === void 0 ? void 0 : file.originalname) === null || _a === void 0 ? void 0 : _a.endsWith(".pdf"))) {
                    return res
                        .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                        .json({ success: false, message: "Invalid PDF, Please Upload PDF" });
                }
                const pdf = await (0, pdf_1.createAndUploadPDF)(file, (_b = req.body) === null || _b === void 0 ? void 0 : _b.title, authUser._id);
                console.log(pdf, "pdf created");
                const resPdf = await (0, pdf_1.getPdfById)(pdf === null || pdf === void 0 ? void 0 : pdf._id);
                return res.status(200).json(resPdf.toJSON());
            }
            catch (error) {
                console.log("########## Error in createPdf", error);
                return res.status(500).json({ error: (0, lodash_1.get)(error, "message") });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map