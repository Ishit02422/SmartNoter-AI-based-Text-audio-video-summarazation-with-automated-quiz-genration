"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManyImages = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param image image class
 */
const deleteManyImages = async (createdAt) => {
    await schema_1.ImageModel.deleteMany(createdAt);
};
exports.deleteManyImages = deleteManyImages;
//# sourceMappingURL=deleteManyImages.js.map