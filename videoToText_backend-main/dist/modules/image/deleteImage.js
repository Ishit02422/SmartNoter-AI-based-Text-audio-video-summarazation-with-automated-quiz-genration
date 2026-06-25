"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param image image class
 */
const deleteImage = async (imageId) => {
    await schema_1.ImageModel.findByIdAndDelete(imageId);
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=deleteImage.js.map