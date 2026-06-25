"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInApp = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param inApp
 * @returns update inApp record
 */
const updateInApp = async (inApp) => {
    await schema_1.inAppModel.findByIdAndUpdate(inApp._id, inApp.toJSON());
    return inApp;
};
exports.updateInApp = updateInApp;
//# sourceMappingURL=updateInApp.js.map