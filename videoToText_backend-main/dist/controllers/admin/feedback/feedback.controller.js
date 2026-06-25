"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const feedback_1 = require("../../../modules/feedback");
class Controller {
    constructor() {
        this.get = async (req, res) => {
            try {
                const feedback = await (0, feedback_1.getPopulatedFeedback)();
                return res.status(200).json(feedback);
            }
            catch (error) {
                console.log("########## Error in Getting feedback", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=feedback.controller.js.map