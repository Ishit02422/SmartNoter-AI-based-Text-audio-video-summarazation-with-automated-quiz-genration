"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveInApp = void 0;
const schema_1 = require("./schema");
const saveInApp = async (inApp) => {
    await new schema_1.inAppModel(inApp.toJSON()).save();
    return inApp;
};
exports.saveInApp = saveInApp;
//# sourceMappingURL=saveApp.js.map