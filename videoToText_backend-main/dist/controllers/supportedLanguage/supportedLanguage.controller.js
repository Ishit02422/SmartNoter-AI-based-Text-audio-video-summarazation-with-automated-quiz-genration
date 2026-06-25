"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const supportedLanguage_1 = require("../../modules/supportedLanguage");
class Controller {
    constructor() {
        this.getSupportedLanguage = async (req, res) => {
            try {
                const supportedLanguageForText = await (0, supportedLanguage_1.getAllSupportedLanguage)();
                return res.status(200).json(supportedLanguageForText);
            }
            catch (error) {
                console.log("########## Error in Getting getSupportedLanguageForDoc", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=supportedLanguage.controller.js.map