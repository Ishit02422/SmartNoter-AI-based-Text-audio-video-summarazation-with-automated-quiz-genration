"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllImage = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name image name
 * @returns relevant category record | null
 */
const getAllImage = async () => {
    const image = await schema_1.ImageModel.find();
    return image ? image.map((item) => new types_1.Image(item)) : null;
};
exports.getAllImage = getAllImage;
//# sourceMappingURL=getAllImage.js.map