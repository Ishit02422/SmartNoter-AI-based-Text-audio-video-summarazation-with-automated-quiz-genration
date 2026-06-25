"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInspiration = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param Inspiration
 * @returns update Inspiration record
 */
const updateInspiration = async (inspiration) => {
    await schema_1.inspirationModel.findByIdAndUpdate(inspiration._id, inspiration.toJSON());
    return inspiration;
};
exports.updateInspiration = updateInspiration;
//# sourceMappingURL=updateInspiration.js.map