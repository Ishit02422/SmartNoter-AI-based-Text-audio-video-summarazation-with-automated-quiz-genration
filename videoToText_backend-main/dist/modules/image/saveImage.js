"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImage = void 0;
const schema_1 = require("./schema");
/**
 * function for save image in database
 * @param image
 * @returns image itself
 */
const saveImage = async (image) => {
    await new schema_1.ImageModel(image.toJSON()).save();
    return image;
};
exports.saveImage = saveImage;
//# sourceMappingURL=saveImage.js.map