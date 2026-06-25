"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInspirationByCategory = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @returns all inspiration records | empty array
 */
const getInspirationByCategory = async (category) => {
    const inspiration = await schema_1.inspirationModel
        .find({ category })
        .lean()
        .populate({ path: "generatedSummaryId", populate: { path: "imageId" } });
    // .sort({ createdAt: -1 });
    return inspiration ? inspiration.map((item) => new types_1.Inspiration(item)) : null;
};
exports.getInspirationByCategory = getInspirationByCategory;
//# sourceMappingURL=getInspirationByCategory.js.map