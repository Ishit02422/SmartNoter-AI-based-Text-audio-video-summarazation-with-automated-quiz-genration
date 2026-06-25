"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageById = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id
 * @returns relevant image
 */
const getImageById = async (_id) => {
    const image = await schema_1.ImageModel.findById(_id);
    return image ? new _1.Image(image) : null;
};
exports.getImageById = getImageById;
//# sourceMappingURL=getImageById.js.map