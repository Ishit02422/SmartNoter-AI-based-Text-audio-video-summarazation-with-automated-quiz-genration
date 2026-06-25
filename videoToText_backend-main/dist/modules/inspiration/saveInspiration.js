"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveInspiration = void 0;
const schema_1 = require("./schema");
const saveInspiration = async (inspiration) => {
    await new schema_1.inspirationModel(inspiration.toJSON()).save();
    return inspiration;
};
exports.saveInspiration = saveInspiration;
//# sourceMappingURL=saveInspiration.js.map