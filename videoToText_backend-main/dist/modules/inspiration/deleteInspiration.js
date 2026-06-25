"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInspiration = void 0;
const schema_1 = require("./schema");
/**
 * will delete Inspiration
 * @param _id
 */
const deleteInspiration = async (_id) => {
    await schema_1.inspirationModel.findByIdAndDelete(_id);
};
exports.deleteInspiration = deleteInspiration;
//# sourceMappingURL=deleteInspiration.js.map