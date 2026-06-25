"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const history_1 = require("../../modules/history");
const http_status_codes_1 = require("http-status-codes");
class Controller {
    constructor() {
        this.get = async (req, res) => {
            try {
                const authUser = req.authUser;
                const history = await (0, history_1.getHistory)(authUser._id);
                if (history.length === 0) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NO_CONTENT)
                        .json({ message: "No History", success: false });
                }
                res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "History Fetched", success: true, result: history });
            }
            catch (error) {
                console.log("error", "error in fetch history", error);
                return res.status(500).json({
                    message: "Something happened wrong try again fetch history after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=history.js.map