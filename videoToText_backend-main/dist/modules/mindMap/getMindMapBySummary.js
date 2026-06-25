"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMindmapSummary = void 0;
const schema_1 = require("./schema");
const getMindmapSummary = async (summaryId, source, userId) => {
    const mindmap = await schema_1.MindMapModel.findOne({ summaryId, userId, source });
    return mindmap;
};
exports.getMindmapSummary = getMindmapSummary;
//# sourceMappingURL=getMindMapBySummary.js.map