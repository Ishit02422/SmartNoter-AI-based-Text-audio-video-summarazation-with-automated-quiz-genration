"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInspirationById = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param _id Inspiration id
 * @returns relevant category record | null
 */
const getInspirationById = async (_id) => {
    const inspiration = await schema_1.inspirationModel
        .findById(_id)
        .lean()
        .populate({ path: "generatedSummaryId", populate: { path: "imageId" } });
    return inspiration ? new types_1.Inspiration(inspiration) : null;
};
exports.getInspirationById = getInspirationById;
//# sourceMappingURL=getInspirationById.js.map